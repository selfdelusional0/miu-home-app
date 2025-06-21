import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import {account, databases, ID} from "@/lib/appwrite";
import icons from "@/constants/icons"; // Make sure this path is correct

const DB_ID = "684f9da6001c19c3c9a0";
const FURNITURE_COLLECTION_ID = "684fab79000bd3a89fbc";

export default function AddInventory() {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [image, setImage] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const router = useRouter();

    const handleAddItem = async () => {
        if (!name || !category || !price || !image || !description) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);

            await databases.createDocument(DB_ID, FURNITURE_COLLECTION_ID, ID.unique(), {
                name,
                category,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                image,
                description,
            });

            Alert.alert("Success", "Item added to inventory.");
            router.replace("/admin/stock");
        } catch (err: any) {
            Alert.alert("Error", err?.message || "Failed to add item.");
        } finally {
            setLoading(false);
        }
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
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-lg font-bold text-[#5d8076]">Miu Home</Text>
                        <TouchableOpacity onPress={toggleNav} className="p-2">
                            <Image source={icons.close} className="w-5 h-5" style={{ tintColor: "#5d8076" }} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => { router.replace("/admin"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { router.replace("/admin/stock"); toggleNav(); }} className="mb-4">
                        <Text className="text-xl text-[#5d8076]">View Stock</Text>
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

            {/* Content */}
            <ScrollView className="flex-1 px-6 pt-10">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={toggleNav} className="mr-3">
                        <Image source={icons.menu} className="w-6 h-6" style={{ tintColor: "#5d8076" }} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-[#5d8076]">Add Inventory Item</Text>
                </View>

                <TextInput
                    placeholder="Name"
                    placeholderTextColor="#888"
                    value={name}
                    onChangeText={setName}
                    className="border border-gray-300 rounded-xl p-4 mb-4 text-base"
                />

                <TextInput
                    placeholder="Category"
                    placeholderTextColor="#888"
                    value={category}
                    onChangeText={setCategory}
                    className="border border-gray-300 rounded-xl p-4 mb-4 text-base"
                />

                <TextInput
                    placeholder="Price"
                    placeholderTextColor="#888"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl p-4 mb-4 text-base"
                />

                <TextInput
                    placeholder="Quanity"
                    placeholderTextColor="#888"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl p-4 mb-4 text-base"
                />

                <TextInput
                    placeholder="Image URL"
                    placeholderTextColor="#888"
                    value={image}
                    onChangeText={setImage}
                    className="border border-gray-300 rounded-xl p-4 mb-4 text-base"
                />

                <TextInput
                    placeholder="Description"
                    placeholderTextColor="#888"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    className="border border-gray-300 rounded-xl p-4 mb-6 text-base"
                />

                <TouchableOpacity
                    onPress={handleAddItem}
                    className={`py-4 rounded-xl items-center ${loading ? "bg-gray-400" : "bg-[#5d8076]"}`}
                    disabled={loading}
                >
                    <Text className="text-white font-semibold text-base">
                        {loading ? "Adding..." : "Add Item"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
