import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const QuillEditor = ReactQuill as unknown as React.ComponentType<{
    theme?: string;
    value?: string;
    onChange?: (value: string) => void;
    modules?: unknown;
    formats?: string[];
    placeholder?: string;
}>;

interface ArticleEditorProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ align: [] }], // Alignment buttons
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "blockquote"],
        ["clean"],
    ],
};

const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "list",
    "bullet",
    "link",
    "image",
    "blockquote",
];

export default function ArticleEditor({
    label,
    value,
    onChange,
    placeholder = "Start writing your article content...",
    className = "",
    required = false,
}: ArticleEditorProps) {
    return (
        <div className={`w-full inline-flex flex-col justify-start items-start gap-2 ${className}`}>
            <style>{`
                .article-editor-container .ql-toolbar.ql-snow {
                    border-top: none;
                    border-left: none;
                    border-right: none;
                    border-bottom: 1px solid #ECECEC;
                    background-color: #F8FAFC;
                    padding: 10px 16px;
                    border-top-left-radius: 16px;
                    border-top-right-radius: 16px;
                }
                /* Fonts */
                .article-editor-container .ql-toolbar.ql-snow * {
                    font-family: 'Poppins', sans-serif !important;
                }
                .article-editor-container .ql-container.ql-snow {
                    border: none;
                    font-family: 'Poppins', sans-serif;
                }
                .article-editor-container .ql-editor {
                    min-height: 280px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 15px;
                    line-height: 1.6;
                    padding: 16px;
                }
                .article-editor-container .ql-editor * {
                    font-family: 'Poppins', sans-serif !important;
                }
                .article-editor-container .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #9EB7DA;
                    left: 16px;
                }

                /* Toolbar Picker Text & Color */
                .article-editor-container .ql-toolbar.ql-snow .ql-picker {
                    color: #000000 !important;
                }
                .article-editor-container .ql-toolbar.ql-snow .ql-picker:hover,
                .article-editor-container .ql-toolbar.ql-snow .ql-picker.ql-expanded {
                    color: #3F71B7 !important;
                }

                /* Default SVG Icons (Stroke & Fill) */
                .article-editor-container .ql-toolbar.ql-snow button .ql-stroke,
                .article-editor-container .ql-toolbar.ql-snow .ql-picker-label .ql-stroke {
                    stroke: #000000 !important;
                    transition: stroke 0.2s ease;
                }
                .article-editor-container .ql-toolbar.ql-snow button .ql-fill,
                .article-editor-container .ql-toolbar.ql-snow .ql-picker-label .ql-fill {
                    fill: #000000 !important;
                    transition: fill 0.2s ease;
                }
                .article-editor-container .ql-toolbar.ql-snow button:hover .ql-stroke,
                .article-editor-container .ql-toolbar.ql-snow button.ql-active .ql-stroke,
                .article-editor-container .ql-toolbar.ql-snow .ql-picker-label:hover .ql-stroke,
                .article-editor-container .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
                    stroke: #3F71B7 !important;
                }
                .article-editor-container .ql-toolbar.ql-snow button:hover .ql-fill,
                .article-editor-container .ql-toolbar.ql-snow button.ql-active .ql-fill,
                .article-editor-container .ql-toolbar.ql-snow .ql-picker-label:hover .ql-fill,
                .article-editor-container .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-fill {
                    fill: #3F71B7 !important;
                }

                /* Custom Link and Image Icons (Using Mask for Color Transitions) */
                .article-editor-container .ql-toolbar.ql-snow button.ql-link svg,
                .article-editor-container .ql-toolbar.ql-snow button.ql-image svg {
                    display: none !important;
                }
                .article-editor-container .ql-toolbar.ql-snow button.ql-link::after {
                    content: '';
                    display: block;
                    width: 100%;
                    height: 100%;
                    background-color: #000000;
                    -webkit-mask: url('/icons/Link.svg') no-repeat center;
                    mask: url('/icons/Link.svg') no-repeat center;
                    -webkit-mask-size: 18px 18px;
                    mask-size: 18px 18px;
                    transition: background-color 0.2s ease;
                }
                .article-editor-container .ql-toolbar.ql-snow button.ql-link:hover::after,
                .article-editor-container .ql-toolbar.ql-snow button.ql-link.ql-active::after {
                    background-color: #3F71B7;
                }
                .article-editor-container .ql-toolbar.ql-snow button.ql-image::after {
                    content: '';
                    display: block;
                    width: 100%;
                    height: 100%;
                    background-color: #000000;
                    -webkit-mask: url('/icons/Image.svg') no-repeat center;
                    mask: url('/icons/Image.svg') no-repeat center;
                    -webkit-mask-size: 18px 18px;
                    mask-size: 18px 18px;
                    transition: background-color 0.2s ease;
                }
                .article-editor-container .ql-toolbar.ql-snow button.ql-image:hover::after,
                .article-editor-container .ql-toolbar.ql-snow button.ql-image.ql-active::after {
                    background-color: #3F71B7;
                }
            `}</style>

            {label && (
                <label className="self-stretch justify-start text-primary text-sm font-normal font-sans">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="article-editor-container self-stretch bg-white border border-[#9EB7DA]/50 rounded-[16px] overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <QuillEditor
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
