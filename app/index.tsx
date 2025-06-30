import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import icons from "@/constants/icons";
import { useRouter } from "expo-router";
import { account, databases, Query } from "@/lib/appwrite";
import {formatPrice} from "@/utils/format";

const DB_ID = "684f9da6001c19c3c9a0";
const FURNITURE_COLLECTION_ID = "684fab79000bd3a89fbc";
const PROFILE_COLLECTION_ID = "684fa618002722712650";

export default function Index() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [items, setItems] = useState<any[]>([]);

    const toggleNav = () => setIsNavOpen(!isNavOpen);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await account.get();
                const userId = session.$id;

                const profile = await databases.getDocument(DB_ID, PROFILE_COLLECTION_ID, userId);

                if (profile.role === "admin") {
                    router.replace("/admin");
                }

                setIsLoggedIn(true);
            } catch (err) {
                router.replace('/landing');
                setIsLoggedIn(false);
                console.log(err);
            }
        };

        const fetchItems = async () => {
            try {
                const res = await databases.listDocuments(DB_ID, FURNITURE_COLLECTION_ID, [
                    Query.limit(20)
                ]);
                setItems(res.documents);
            } catch (err) {
                Alert.alert("Error", "Failed to load items.");
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

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <View className="flex-1 bg-white">
            {isNavOpen && (
                <View className="absolute left-0 top-0 bottom-0 w-64 bg-gray-100 z-20 p-6 shadow-md">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-lg font-bold text-[#5d8076]">Miu Home</Text>
                        <TouchableOpacity onPress={toggleNav} className="p-2">
                            <Image source={icons.close} className="w-5 h-5" style={{ tintColor: "#5d8076" }} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => { router.replace("/"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { router.push("/favourite"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">Favourite</Text>
                    </TouchableOpacity>

                    {isLoggedIn ? (
                        <View>
                            <TouchableOpacity onPress={() => { router.push("/order"); toggleNav(); }} className="mb-4">
                                <Text className="text-xl text-[#5d8076]">My Order</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleLogout} className="mb-4">
                                <Text className="text-xl text-[#5d8076]">Logout</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => { router.replace("/login"); toggleNav(); }} className="mb-4">
                            <Text className="text-xl text-[#5d8076]">Login</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View className="flex-1 px-4 pt-10">
                <View className="flex-row items-center w-full">
                    <TouchableOpacity onPress={toggleNav} className="mr-3">
                        <Image source={icons.menu} className="w-6 h-6" style={{ tintColor: "#5d8076" }} />
                    </TouchableOpacity>

                    <View className="flex-1 mr-3 relative">
                        <TextInput
                            className="w-full border border-gray-300 rounded-full p-3 pl-10 text-base"
                            placeholder="Search products..."
                            placeholderTextColor="#5d8076"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        <Image
                            source={icons.search}
                            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2"
                            style={{ tintColor: "#5d8076" }}
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-[#5d8076] px-6 py-3 rounded-full items-center justify-center"
                        onPress={() => router.push("/cart")}
                    >
                        <Image source={icons.cart} className="w-5 h-5" tintColor="#ffffff" />
                    </TouchableOpacity>
                </View>

                <View className="mt-6">
                    <Text className="text-lg font-bold mb-3 text-[#5d8076]">Top Deals</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-1">
                        {filteredItems.slice(0, 5).map((item) => (
                            <TouchableOpacity
                                key={item.$id}
                                onPress={() =>
                                    router.push({ pathname: "/product/[id]", params: { id: item.$id } })
                                }
                                className="w-48 h-80 rounded-2xl overflow-hidden mx-2 bg-[#f1f1f1] shadow-md"
                            >
                                <View className="flex-1 items-center justify-center p-3">
                                    <Image
                                        source={{ uri: item.image }}
                                        className="w-40 h-40 rounded-xl border border-gray-300"
                                        resizeMode="cover"
                                    />
                                </View>
                                <View className="bg-[#e0e0e0] p-3">
                                    <Text className="text-base font-semibold text-gray-800 text-center">{item.name}</Text>
                                    <Text className="text-sm text-gray-600 text-center">{item.category}</Text>
                                    <Text className="text-base font-bold text-[#5d8076] text-center mt-1">
                                        RM {formatPrice(item.price)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View className="mt-6">
                    <Text className="text-lg font-bold mb-3 text-[#5d8076]">New Arrival</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-1">
                        {filteredItems.slice(-5).map((item) => (
                            <TouchableOpacity
                                key={item.$id}
                                onPress={() =>
                                    router.push({ pathname: "/product/[id]", params: { id: item.$id } })
                                }
                                className="w-48 h-80 rounded-xl overflow-hidden mx-2 bg-[#f1f1f1]"
                            >
                                <View className="flex-1 items-center justify-center p-2">
                                    <Image
                                        source={{ uri: item.image }}
                                        className="w-40 h-40 rounded-lg border border-gray-300"
                                    />
                                </View>
                                <View className="bg-[#e0e0e0] p-3">
                                    <Text className="text-base font-semibold text-gray-800 text-center">{item.name}</Text>
                                    <Text className="text-sm text-gray-600 text-center">{item.category}</Text>
                                    <Text className="text-base font-bold text-[#5d8076] text-center mt-1">
                                        RM {formatPrice(item.price)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
