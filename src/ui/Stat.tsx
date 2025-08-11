import { YStack, H1, Paragraph } from "tamagui";

export function Stat({ value, caption }: { value: string; caption: string }) {
  return (
    <YStack f={1} ai="center" gap="$1">
      <H1>{value}</H1>
      <Paragraph size="$2" theme="alt2">{caption}</Paragraph>
    </YStack>
  );
}