import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Box, Paper, ToggleButton, ToggleButtonGroup, IconButton, Tooltip, Divider } from '@mui/material';
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react';

interface EntryEditorProps {
    initialContent?: string;
    onUpdate: (content: string) => void;
    editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <Box
            sx={{
                py: 1,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2
            }}
        >
            <ToggleButtonGroup size="small" exclusive aria-label="text formatting">
                <ToggleButton
                    value="bold"
                    selected={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    sx={{ border: 'none', borderRadius: 2 }}
                >
                    <Bold size={18} />
                </ToggleButton>
                <ToggleButton
                    value="italic"
                    selected={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    sx={{ border: 'none', borderRadius: 2 }}
                >
                    <Italic size={18} />
                </ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup size="small" exclusive aria-label="lists">
                <ToggleButton
                    value="bulletList"
                    selected={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    sx={{ border: 'none', borderRadius: 2 }}
                >
                    <List size={18} />
                </ToggleButton>
                <ToggleButton
                    value="orderedList"
                    selected={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    sx={{ border: 'none', borderRadius: 2 }}
                >
                    <ListOrdered size={18} />
                </ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup size="small" exclusive>
                <ToggleButton
                    value="blockquote"
                    selected={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    sx={{ border: 'none', borderRadius: 2 }}
                >
                    <Quote size={18} />
                </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ flexGrow: 1 }} />

            <IconButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} size="small">
                <Undo size={18} />
            </IconButton>
            <IconButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} size="small">
                <Redo size={18} />
            </IconButton>
        </Box>
    );
};

export default function EntryEditor({ initialContent = '', onUpdate, editable = true }: EntryEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
        ],
        content: initialContent,
        editable: editable,
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose mx-auto focus:outline-none min-h-[300px] p-4 dark:prose-invert',
            },
        },
    });

    React.useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    return (
        <Box sx={{ width: '100%' }}>
            {editable && <MenuBar editor={editor} />}
            <Box sx={{ p: 0 }}>
                <EditorContent editor={editor} />
            </Box>
        </Box>
    );
}
