import React, { useEffect, useState } from "react";
import {View, Text, ScrollView, TouchableOpacity, Alert, Image} from "react-native";
import { useRouter } from "expo-router";
import {account, databases} from "@/lib/appwrite";
import icons from "@/constants/icons";
import {formatPrice} from "@/utils/format";

const DB_ID = "684f9da6001c19c3c9a0";
const FURNITURE_COLLECTION_ID = "684fab79000bd3a89fbc"; // Replace with your real collection ID

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await databases.listDocuments(DB_ID, FURNITURE_COLLECTION_ID);
            setItems(res.documents);
        } catch (err) {
            // Alert.alert("Error", "Failed to load inventory.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert("Confirm", "Are you sure you want to delete this item?", [
            { text: "Cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await databases.deleteDocument(DB_ID, FURNITURE_COLLECTION_ID, id);
                        fetchItems(); // Refresh list
                    } catch {
                        Alert.alert("Error", "Could not delete item.");
                    }
                },
            },
        ]);
    };

    const toggleNav = () => setIsNavOpen(!isNavOpen);

    useEffect(() => {
        const checkSession = async () => {
            try {
                await account.get();
                setIsLoggedIn(true);
            } catch {
                setIsLoggedIn(false);
            }
        };

        checkSession();
        fetchItems();
    }, []);

    const handleLogout = async () => {
        try {
            await account.deleteSession("current");
            setIsLoggedIn(false);
            toggleNav();
            router.replace("/");
        } catch (err) {
            console.log("Logout failed", err);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Navigation Panel */}
            {isNavOpen && (
                <View className="absolute left-0 top-0 bottom-0 w-64 bg-gray-100 z-20 p-6 shadow-md">
                    {/* Header Row with Miu Home and Close Button */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-lg font-bold text-[#5d8076]">Miu Home</Text>
                        <TouchableOpacity onPress={toggleNav} className="p-2">
                            <Image source={icons.close} className="w-5 h-5" style={{ tintColor: "#5d8076" }} />
                        </TouchableOpacity>
                    </View>

                    {/* Navigation Links */}
                    <TouchableOpacity onPress={() => { router.replace("/admin"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { router.replace("/admin/stock"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">View Stock</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { router.replace("/admin/order"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">View Order</Text>
                    </TouchableOpacity>

                    {isLoggedIn ? (
                        <TouchableOpacity onPress={handleLogout} className="mb-4">
                            <Text className="text-xl text-[#5d8076]">Logout</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => { router.replace("/login"); toggleNav(); }} className="mb-4">
                            <Text className="text-xl text-[#5d8076]">Login</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Combined Header + ScrollView */}
            <ScrollView className="flex-1 bg-white px-4 pt-10">

                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={toggleNav} className="mr-3">
                            <Image source={icons.menu} className="w-6 h-6" style={{ tintColor: "#5d8076" }} />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-[#5d8076]">Inventory</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.replace("/admin/add")}
                        className="px-4 py-2 bg-[#5d8076] rounded-full"
                    >
                        <Text className="text-white text-lg font-bold">Add</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <Text>Loading...</Text>
                ) : (
                    items.map((item: any) => (
                        <View
                            key={item.$id}
                            className="mb-4 p-4 border border-gray-300 rounded-xl bg-gray-50"
                        >
                            {item.image ? (
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ width: '100%', height: 160, borderRadius: 12, marginBottom: 12 }}
                                    resizeMode="cover"
                                />
                            ) : null}

                            <Text className="text-lg font-semibold">{item.name}</Text>
                            <Text className="text-sm text-gray-600">Quantity: {item.quantity}</Text>
                            <Text className="text-sm text-gray-600">Category: {item.category}</Text>
                            <Text className="text-sm text-gray-800 font-medium">
                                Price: RM {formatPrice(item.price)}
                            </Text>

                            <View className="flex-row mt-3">
                                <TouchableOpacity
                                    className="bg-[#5d8076] px-4 py-2 rounded-xl mr-2"
                                    onPress={() => router.push(`/admin/edit/${item.$id}`)}
                                >
                                    <Text className="text-white text-sm">Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="bg-red-500 px-4 py-2 rounded-xl"
                                    onPress={() => handleDelete(item.$id)}
                                >
                                    <Text className="text-white text-sm">Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>

    );
}
