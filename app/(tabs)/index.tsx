import { YStack, H2, Paragraph, XStack } from "tamagui";
import Details from "@/app/details";

// simple dark/light-safe card
function Surface(props: any) {
  return (
    <YStack
      p="$4"
      br="$16"
      bg="$backgroundStrong"
      borderWidth={1}
      borderColor="$borderColor"
      {...props}
    />
  );
}

export default function Home() {
  return (
    <YStack f={1} bg="$background">
      <Details />
    </YStack>
  );
}
