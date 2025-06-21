import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const stored = await AsyncStorage.getItem("favorites");
                if (stored) setFavorites(JSON.parse(stored));
            } catch (error) {
                console.error("Error loading favorites", error);
            }
        };

        loadFavorites();
    }, []);

    const removeFavorite = async (id) => {
        const updated = favorites.filter((item) => item.$id !== id);
        setFavorites(updated);
        await AsyncStorage.setItem("favorites", JSON.stringify(updated));
    };

    return (
        <ScrollView className="flex-1 bg-white px-4 pt-10">
            <Text className="text-2xl font-bold text-[#5d8076] mb-4">My Favorites</Text>

            {favorites.length === 0 ? (
                <Text className="text-gray-500">You have no favorites yet.</Text>
            ) : (
                favorites.map((item) => (
                    <TouchableOpacity
                        key={item.$id}
                        onPress={() => router.push({
                            pathname: "/product/[id]",
                            params: { id: item.$id }
                        })}
                        className="mb-4 p-4 border border-gray-300 rounded-xl bg-gray-50"
                    >
                        <View className="flex-row items-center space-x-4">
                            <Image
                                source={{ uri: item.image }}
                                className="w-20 h-20 mr-2 rounded-lg"
                            />
                            <View className="flex-1">
                                <Text className="text-lg font-bold">{item.name}</Text>
                                <Text className="text-sm text-gray-600">{item.category}</Text>
                                <Text className="text-[#5d8076] font-semibold">RM {item.price}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeFavorite(item.$id)}>
                                <Text className="text-red-500">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}
