import React, { useMemo } from "react";
import { router } from "expo-router";
import { Box, Text } from "../../src/theme/theme";
import Card from "../../src/components/Card";
import ProgressBar from "../../src/components/ProgressBar";
import { useBooks } from "../../src/store/books";

export default function Home() {
  const { books, currentId, reviews } = useBooks();
  const current = currentId ? books[currentId] : undefined;
  const due = useMemo(() => reviews.filter(r => r.dueAt <= Date.now()).length, [reviews]);

  return (
    <Box flex={1} bg="background" padding="md" gap="md">
      {/* 1) Currently reading */}
      <Card
        title={current ? current.title : "No book selected"}
        subtitle={current ? "Continue reading" : "Pick a book to start"}
        onPress={() => current && router.push(`/reading/${current.id}`)}
        right={current ? <Text color="mutedForeground">{Math.round((current.progress || 0)*100)}%</Text> : null}
      >
        {current ? <Box marginTop="sm"><ProgressBar value={current.progress} /></Box> : null}
      </Card>

      {/* 2) Add new book */}
      <Card
        title="Add a new book"
        subtitle="Import from your phone"
        onPress={() => router.push("/add-book")}
        right={<Text color="primary">+</Text>}
      />

      {/* 3) Words to review */}
      <Card
        title="Words & phrases to review"
        subtitle={due ? `${due} due` : "You're all caught up"}
        onPress={() => router.push("/review")}
      />
    </Box>
  );
}
