import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = [
  '😀', '😂', '😊', '😍', '🥰', '😅', '😢', '😮',
  '🙏', '👍', '👎', '👏', '🙌', '💪', '❤️', '🤒',
  '🤕', '🤧', '😷', '🩺', '💊', '🌡️', '🎉', '✅',
];

interface EmojiPickerProps {
  open: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ open, onSelect, onClose }: EmojiPickerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 z-50 grid grid-cols-8 gap-1 rounded-xl border border-slate-100 bg-paper-0 shadow-lg p-3 w-72"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-ivory-100 text-lg transition-colors duration-fast"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
