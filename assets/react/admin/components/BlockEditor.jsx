import { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Image from '@editorjs/image';

export default function BlockEditor({ value, onChange, uploadImageUrl }) {
    const holderRef = useRef(null);
    const editorRef = useRef(null);
    // Kept in a ref so the onChange closure always sees the latest callback
    // without triggering an effect re-run that would destroy / recreate the editor.
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (!holderRef.current || editorRef.current) return;

        const editor = new EditorJS({
            holder: holderRef.current,
            data: value ?? { blocks: [] },
            placeholder: 'Commencez à rédiger votre article…',
            tools: {
                header: {
                    class: Header,
                    inlineToolbar: true,
                    config: { levels: [2, 3, 4], defaultLevel: 2 },
                },
                list: {
                    class: List,
                    inlineToolbar: true,
                },
                quote: {
                    class: Quote,
                    inlineToolbar: true,
                },
                code: Code,
                delimiter: Delimiter,
                image: {
                    class: Image,
                    config: {
                        endpoints: { byFile: uploadImageUrl },
                        additionalRequestHeaders: {
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                },
            },
            onChange: async (api) => {
                const data = await api.saver.save();
                onChangeRef.current(data);
            },
        });

        editorRef.current = editor;

        return () => {
            // Capture the instance before clearing the ref so the async
            // callback below still has access to it after unmount.
            const instance = editorRef.current;
            editorRef.current = null;

            if (instance) {
                // destroy() must only be called after isReady resolves —
                // calling it earlier throws "is not a function" in some states.
                instance.isReady
                    .then(() => instance.destroy())
                    .catch(() => {});
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={holderRef}
            className="min-h-64 rounded-md border bg-background px-4 py-3 text-sm
                [&_.ce-block]:py-0.5
                [&_.ce-toolbar__plus]:text-muted-foreground
                [&_.ce-toolbar__settings-btn]:text-muted-foreground
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2
                [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-2
                [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:my-1
                [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic
                [&_ul]:list-disc [&_ul]:pl-6
                [&_ol]:list-decimal [&_ol]:pl-6"
        />
    );
}
