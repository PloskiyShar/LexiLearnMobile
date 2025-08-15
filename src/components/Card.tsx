import React from "react";
import {Alert, TouchableOpacity} from "react-native";
import { Box, Text } from "../theme/theme";
import {MaterialIcons} from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode | string;
  children?: React.ReactNode;
  onDelete?: () => void;
};

export default function Card({ title, subtitle, onPress, right, children, onDelete }: Props) {
  const Container: any = onPress ? TouchableOpacity : Box;
  return (
    <Box bg="card" borderRadius="xl" style={{ borderWidth: 1 }} borderColor="border" overflow="hidden">
      <Container onPress={onPress} style={{ padding: 16 }}>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Text variant="heading">{title}</Text>
            {subtitle ? <Text color="mutedForeground">{subtitle}</Text> : null}
          </Box>
          {typeof right === 'string' ? <Text>{right}</Text> : right}
          {onDelete && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Delete Book", `Are you sure you want to delete "${title}"?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: onDelete },
                ])
              }
              style={{ marginLeft: 12 }}
            >
              <MaterialIcons name="delete" size={20} color="red" />
            </TouchableOpacity>
          )}
        </Box>
        {children}
      </Container>
    </Box>
  );
}
