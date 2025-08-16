import React from "react";
import { Stack } from "expo-router";
import { useBooks } from "../src/store/books";
import BackButton from "src/components/BackButton";
import {ScrollView, Text, View} from "react-native";
import {getColor} from "src/theme/getColor";

export default function Review() {
  const { popDue } = useBooks();
  const [item, setItem] = React.useState(() => popDue());
  const { books, setCurrent, updateProgress, setLocation } = useBooks() as any;
  const book = books?.[1755253839610] || undefined;


  const next = () => setItem(popDue());

  return (
    <>
    <Stack.Screen
      options={{
        title: 'Review',
        headerLargeTitle: false,
        headerShadowVisible: false,
        headerTintColor: getColor('label', '#345555', '#555555'),
        headerTransparent: false,
        headerStyle: { backgroundColor: getColor('systemBackground', '#fff', '#000') },
        headerShown: true,
        headerLeft: () => <BackButton />,
      }}
    />
    <View>
      <ScrollView>
          <Text style={{color: '#fff'}}>
            {"nothing to see here yet"}
          </Text>
      </ScrollView>
    </View>

    </>
  );
}
