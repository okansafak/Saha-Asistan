import { promises as fs } from 'fs';
import path from 'path';
import { Request, Response } from 'express';

const DATA_PATH = path.join(__dirname, 'data', 'forms.json');

export interface FormField {
  label: string;
  type: string;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  fields: FormField[];
}

async function readForms(): Promise<Form[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeForms(forms: Form[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(forms, null, 2), 'utf-8');
}

// GET /api/forms
export async function getForms(req: Request, res: Response) {
  const forms = await readForms();
  res.status(200).json(forms);
}

// POST /api/forms
export async function createForm(req: Request, res: Response) {
  const forms = await readForms();
  const newForm = { ...req.body, id: Date.now().toString() };
  forms.push(newForm);
  await writeForms(forms);
  res.status(201).json(newForm);
}

// PUT /api/forms/:id
export async function updateForm(req: Request, res: Response) {
  const { id } = req.query;
  const forms = await readForms();
  const idx = forms.findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Form not found' });
  forms[idx] = { ...forms[idx], ...req.body };
  await writeForms(forms);
  res.status(200).json(forms[idx]);
}

// GET /api/forms/:id
export async function getFormById(req: Request, res: Response) {
  const { id } = req.query;
  const forms = await readForms();
  const form = forms.find(f => f.id === id);
  if (!form) return res.status(404).json({ error: 'Form not found' });
  res.status(200).json(form);
}
