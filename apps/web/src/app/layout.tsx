import "./globals.css";

export const metadata = {
  title: 'ReadMind - AI 阅读翻译助手',
  description: 'AI 阅读翻译助手 - 沉浸式双语翻译与学习',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
