import { Surface } from "./Surface";
import { Paragraph, YStack } from "tamagui";

export function TimelineItem({ time, title, subtitle }: { time: string; title: string; subtitle?: string }) {
  return (
    <Surface>
      <YStack gap="$1">
        <Paragraph size="$2" color="$color">{time}</Paragraph>
        <Paragraph color="$color">{title}</Paragraph>
        {subtitle && <Paragraph theme="alt2" size="$2">{subtitle}</Paragraph>}
      </YStack>
    </Surface>
  );
}