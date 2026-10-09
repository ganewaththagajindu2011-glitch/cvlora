import type { Metadata } from 'next';
import Editor from './editor';
import './editor.css';
export const metadata: Metadata = {
  title: 'Create your CV',
  robots: { index: false, follow: false },
};
export default function EditorPage() {
  return <Editor />;
}
