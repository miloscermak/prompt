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
  'gpt-5-instant': { provider: 'openai', model: 'gpt-4-turbo' }, // Using GPT-4 Turbo as placeholder for GPT-5
  'gpt-5-thinking': { provider: 'openai', model: 'gpt-4' }, // Using GPT-4 as placeholder for GPT-5 Thinking
  'gemini-2.5-flash': { provider: 'google', model: 'gemini-1.5-flash-latest' }, // Using Gemini 1.5 Flash
  'gemini-2.5-pro': { provider: 'google', model: 'gemini-1.5-pro-latest' }, // Using Gemini 1.5 Pro
  'claude-opus-4.1': { provider: 'anthropic', model: 'claude-3-opus-20240229' }, // Using Claude 3 Opus
  'claude-sonnet-4.5': { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' }, // Using Claude 3.5 Sonnet
};

// Function to call OpenAI
async function callOpenAI(model, prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0].message.content;
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
    return response.content[0].text;
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
    return response.text();
  } catch (error) {
    console.error('Google Error:', error);
    return `Error: ${error.message}`;
  }
}

// Main endpoint to test models
app.post('/api/test', async (req, res) => {
  try {
    const { prompt, models, count } = req.body;

    if (!prompt || !models || !count) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (count < 1 || count > 100) {
      return res.status(400).json({ error: 'Count must be between 1 and 100' });
    }

    const results = [];

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

        results.push({
          model: modelKey,
          responseNumber: i + 1,
          timestamp: new Date().toISOString(),
          response: response,
        });

        console.log(`Completed ${modelKey} response ${i + 1}/${count}`);
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
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
