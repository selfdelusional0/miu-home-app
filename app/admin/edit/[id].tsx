import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { databases } from "@/lib/appwrite";

const DB_ID = "684f9da6001c19c3c9a0";
const FURNITURE_COLLECTION_ID = "684fab79000bd3a89fbc";

export default function EditProduct() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const doc = await databases.getDocument(
                    DB_ID,
                    FURNITURE_COLLECTION_ID,
                    String(id)
                );
                setName(doc.name || "");
                setQuantity(String(doc.quantity ?? ""));
                setCategory(doc.category || "");
                setPrice(String(doc.price ?? ""));
                setImage(doc.image || "");

            } catch (error) {
                Alert.alert("Error", "Failed to load product.");
                router.replace("/admin/stock");
            }
        };
        fetchProduct();
    }, [id]);

    const handleUpdate = async () => {
        if (!name || !quantity || !category || !price ) {
            Alert.alert("Missing Info", "Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);
            await databases.updateDocument(
                DB_ID,
                FURNITURE_COLLECTION_ID,
                String(id),
                {
                    name,
                    quantity: parseInt(quantity),
                    category,
                    price: parseFloat(price),
                    image,
                }
            );
            Alert.alert("Success", "Product updated.");
            router.replace("/admin/stock");
        } catch (error) {
            Alert.alert("Error", "Update failed.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white px-4 pt-10">
            <Text className="text-2xl font-bold text-[#5d8076] mb-6">
                Edit Product
            </Text>

            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                className="border border-gray-300 rounded-xl p-4 mb-4"
            />

            <TextInput
                placeholder="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                className="border border-gray-300 rounded-xl p-4 mb-4"
            />

            <TextInput
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
                className="border border-gray-300 rounded-xl p-4 mb-4"
            />

            <TextInput
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                className="border border-gray-300 rounded-xl p-4 mb-4"
            />

            <TextInput
                placeholder="Image Url"
                value={image}
                onChangeText={setImage}
                keyboardType="decimal-pad"
                className="border border-gray-300 rounded-xl p-4 mb-4"
            />

            <TouchableOpacity
                onPress={handleUpdate}
                className={`py-4 rounded-xl items-center ${
                    loading ? "bg-gray-400" : "bg-[#5d8076]"
                }`}
                disabled={loading}
            >
                <Text className="text-white font-semibold text-base">
                    {loading ? "Updating..." : "Update Product"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
