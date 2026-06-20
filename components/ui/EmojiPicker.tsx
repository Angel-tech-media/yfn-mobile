import EmojiPickerComponent from 'rn-emoji-keyboard';

type EmojiPickerProps = {
  onEmojiSelected: (emoji: string) => void;
  onClose: () => void;
};

export function EmojiPicker({ onEmojiSelected, onClose }: EmojiPickerProps) {
  return (
    <EmojiPickerComponent
      onEmojiSelected={(emojiObject) => {
        onEmojiSelected(emojiObject.emoji);
      }}
      open={true}
      onClose={onClose}
    />
  );
}
