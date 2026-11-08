import { supabase } from './supabase';

export interface AnonymousEditFields {
  title: string; intro: string; questionLabel: string; confessionLabel: string;
  placeholder: string; accent: 'violet' | 'rose' | 'dark';
}
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export async function loadAnonymousExperienceForEdit(id: string, creatorId: string) {
  const { data, error } = await supabase.from('experiences')
    .select('id,title,content').eq('id', id).eq('creator_id', creatorId)
    .eq('type', 'question_confession').single();
  if (error || !data) throw new Error('Content could not be loaded.');
  return { ...data, content: object(data.content), config: object(object(data.content).questionConfession) };
}

export async function updateAnonymousExperience(id: string, creatorId: string, fields: AnonymousEditFields) {
  // Re-read to preserve unrelated fields, the original mode and legacy mixed-mode links.
  const existing = await loadAnonymousExperienceForEdit(id, creatorId);
  const { data, error } = await supabase.from('experiences').update({
    title: fields.title.trim(), description: fields.intro.trim(),
    cover_style: fields.accent === 'dark' ? 'dark' : fields.accent === 'rose' ? 'pink' : 'purple',
    content: { ...existing.content, questionConfession: { ...existing.config,
      intro: fields.intro.trim(), questionLabel: fields.questionLabel.trim(),
      confessionLabel: fields.confessionLabel.trim(), placeholder: fields.placeholder.trim(), accent: fields.accent,
    } },
  }).eq('id', id).eq('creator_id', creatorId).eq('type', 'question_confession').select('id').single();
  if (error || !data) throw new Error('Changes could not be saved.');
}
