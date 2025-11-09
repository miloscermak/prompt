import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import XLSX from 'xlsx';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Model configurations
const MODEL_CONFIG = {
  'gpt-5-instant': { provider: 'openai', model: 'gpt-5' }, // GPT-5 (August 2025)
  'gpt-5-thinking': { provider: 'openai', model: 'gpt-5-pro' }, // GPT-5 Pro with advanced reasoning (October 2025)
  'gemini-2.5-flash': { provider: 'google', model: 'gemini-2.5-flash' }, // Gemini 2.5 Flash (June 2025)
  'gemini-2.5-pro': { provider: 'google', model: 'gemini-2.5-pro' }, // Gemini 2.5 Pro (June 2025)
  'claude-opus-4.1': { provider: 'anthropic', model: 'claude-opus-4-1-20250805' }, // Claude Opus 4.1 (August 2025)
  'claude-sonnet-4.5': { provider: 'anthropic', model: 'claude-sonnet-4-5-20250929' }, // Claude Sonnet 4.5 (September 2025)
};

// Function to call OpenAI
async function callOpenAI(model, prompt) {
  try {
    // GPT-5 models use the new v1/responses endpoint
    if (model.startsWith('gpt-5')) {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          input: prompt,
          // GPT-5 only supports default temperature (1)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();

      // GPT-5 returns object with "output" array containing message objects
      if (data.output && Array.isArray(data.output)) {
        const messageObj = data.output.find(item => item.type === 'message');
        if (messageObj?.content && Array.isArray(messageObj.content)) {
          const textContent = messageObj.content.find(c => c.type === 'output_text');
          if (textContent?.text) {
            return textContent.text;
          }
        }
      }

      // Fallback: try standard structure
      const result = data.choices?.[0]?.text || data.output;
      if (typeof result === 'string') {
        return result;
      }

      // Last resort: return error message instead of full JSON (which can crash connection)
      return 'Error: Unable to parse GPT-5 response';
    } else {
      // GPT-4 and older models use chat/completions
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      return response.choices[0].message.content;
    }
  } catch (error) {
    console.error('OpenAI Error:', error);
    return `Error: ${error.message}`;
  }
}

// Function to call Anthropic Claude
async function callAnthropic(model, prompt) {
  try {
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content[0].text;
    // Ensure we return a string
    return typeof text === 'string' ? text : JSON.stringify(text);
  } catch (error) {
    console.error('Anthropic Error:', error);
    return `Error: ${error.message}`;
  }
}

// Function to call Google Gemini
async function callGoogle(model, prompt) {
  try {
    const genModel = googleAI.getGenerativeModel({ model: model });
    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Ensure we return a string
    return typeof text === 'string' ? text : JSON.stringify(text);
  } catch (error) {
    console.error('Google Error:', error);
    return `Error: ${error.message}`;
  }
}

// Main endpoint to test models (with streaming)
app.post('/api/test', async (req, res) => {
  try {
    const { prompt, models, count } = req.body;

    if (!prompt || !models || !count) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (count < 1 || count > 100) {
      return res.status(400).json({ error: 'Count must be between 1 and 100' });
    }

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generate responses for each selected model
    for (const modelKey of models) {
      const config = MODEL_CONFIG[modelKey];
      if (!config) {
        console.warn(`Unknown model: ${modelKey}`);
        continue;
      }

      console.log(`Testing ${modelKey} with ${count} responses...`);

      for (let i = 0; i < count; i++) {
        let response;

        switch (config.provider) {
          case 'openai':
            response = await callOpenAI(config.model, prompt);
            break;
          case 'anthropic':
            response = await callAnthropic(config.model, prompt);
            break;
          case 'google':
            response = await callGoogle(config.model, prompt);
            break;
          default:
            response = 'Unknown provider';
        }

        const result = {
          model: modelKey,
          responseNumber: i + 1,
          timestamp: new Date().toISOString(),
          response: response,
        };

        // Send result immediately via SSE
        res.write(`data: ${JSON.stringify(result)}\n\n`);

        console.log(`Completed ${modelKey} response ${i + 1}/${count}`);
      }
    }

    // Send completion signal
    res.write('data: {"done": true}\n\n');
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.write(`data: {"error": "${error.message}"}\n\n`);
    res.end();
  }
});

// Endpoint to generate Excel file
app.post('/api/export-excel', (req, res) => {
  try {
    const { results, prompt } = req.body;

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'Invalid results data' });
    }

    // Prepare data for Excel
    const excelData = results.map((result) => ({
      'Model': result.model,
      'Response #': result.responseNumber,
      'Timestamp': result.timestamp,
      'Prompt': prompt,
      'Response': result.response,
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Model
      { wch: 12 }, // Response #
      { wch: 20 }, // Timestamp
      { wch: 50 }, // Prompt
      { wch: 100 }, // Response
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'AI Model Responses');

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Send file
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ai-model-responses-${Date.now()}.xlsx`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(excelBuffer);
  } catch (error) {
    console.error('Excel Export Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
