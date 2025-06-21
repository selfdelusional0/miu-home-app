import React, { useEffect, useState } from "react";
import { Alert, View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { account } from "@/lib/appwrite";

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const router = useRouter();
    const DELIVERY_FEE = 10;

    useEffect(() => {
        const loadCart = async () => {
            try {
                const saved = await AsyncStorage.getItem("cart");
                if (saved) setCartItems(JSON.parse(saved));
            } catch (error) {
                console.error("Error loading cart", error);
            }
        };
        loadCart();
    }, []);

    const removeFromCart = async (id) => {
        const updatedCart = cartItems.filter((item) => item.$id !== id);
        setCartItems(updatedCart);
        await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + parseFloat(item.price), 0);
    };

    const subtotal = calculateSubtotal();
    const total = subtotal + DELIVERY_FEE;

    return (
        <ScrollView className="flex-1 bg-white px-4 pt-10">
            <Text className="text-2xl font-bold text-[#5d8076] mb-4">My Cart</Text>

            {cartItems.length === 0 ? (
                <Text className="text-gray-500">Your cart is empty.</Text>
            ) : (
                <>
                    {cartItems.map((item) => (
                        <View key={item.$id} className="mb-4 p-4 border border-gray-300 rounded-xl bg-gray-50">
                            <View className="flex-row items-center space-x-4">
                                <Image source={{ uri: item.image }} className="w-20 h-20 mr-2 rounded-lg" />
                                <View className="flex-1">
                                    <Text className="text-lg font-bold">{item.name}</Text>
                                    <Text className="text-sm text-gray-600">{item.category}</Text>
                                    <Text className="text-[#5d8076] font-semibold">RM {item.price}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeFromCart(item.$id)}>
                                    <Text className="text-red-500">Remove</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {/* Price Summary */}
                    <View className="border-t border-gray-300 pt-4 mt-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-700">Subtotal</Text>
                            <Text className="text-gray-700">RM {subtotal.toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-700">Delivery</Text>
                            <Text className="text-gray-700">RM {DELIVERY_FEE.toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-lg font-bold text-[#5d8076]">Total</Text>
                            <Text className="text-lg font-bold text-[#5d8076]">RM {total.toFixed(2)}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="bg-[#5d8076] p-4 rounded-xl mt-2 items-center"
                        onPress={async () => {
                            try {
                                await account.get(); // Check session
                                const cartPayload = cartItems.map((item) => ({
                                    id: item.$id,
                                    name: item.name,
                                    price: item.price,
                                    image: item.image,
                                }));

                                const encoded = encodeURIComponent(JSON.stringify(cartPayload));

                                router.push({
                                    pathname: "/payment",
                                    params: {
                                        cart: encoded,
                                        source: "cart",
                                    },
                                });
                            } catch {
                                Alert.alert("Login Required", "Please log in before checking out.");
                                router.replace("/login");
                            }
                        }}
                    >
                        <Text className="text-white font-semibold">Checkout</Text>
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
}
