import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

/** Article body renderer. Raw HTML is not parsed (react-markdown default) and output is sanitized. */
export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
      {source}
    </ReactMarkdown>
  )
}
