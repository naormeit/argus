import { useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  language?: string
  disabled?: boolean
}

const PLACEHOLDER = `// Paste your Solidity contract here...
// Example: a vulnerable reentrancy contract

pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        // BUG: external call before state update
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        balances[msg.sender] = 0;
    }
}`

export default function CodeEditor({ value, onChange, language = 'solidity', disabled = false }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      // cap at 480px so the report stays visible without excessive scrolling
      textareaRef.current.style.height = `${Math.min(480, Math.max(320, textareaRef.current.scrollHeight))}px`
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end   = e.currentTarget.selectionEnd
      onChange(value.substring(0, start) + '    ' + value.substring(end))
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4
          textareaRef.current.selectionEnd   = start + 4
        }
      })
    }
  }

  return (
    <div className="relative rounded-lg border border-argus-border bg-argus-panel overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-argus-border">
        <span className="text-xs text-argus-muted font-mono">{language}</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER}
        disabled={disabled}
        spellCheck={false}
        className="w-full p-4 bg-transparent text-sm font-mono text-gray-200 resize-none outline-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-argus-muted/40"
        style={{ minHeight: 320, maxHeight: 480 }}
      />
    </div>
  )
}
