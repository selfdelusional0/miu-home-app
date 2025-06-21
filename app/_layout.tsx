import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext"; // Make sure this path is correct
import { Stack } from "expo-router";
import './global.css';

export default function RootLayout() {
    return (
        <AuthProvider>
            <CartProvider>
                <Stack>
                    <Stack.Screen name="index" options={{ title: "Miu Home" }} />
                    <Stack.Screen name="login" options={{ title: "Miu Home" }} />
                    <Stack.Screen name="order" options={{ title: "Miu Home" }} />
                    <Stack.Screen name="favourite" options={{ title: "Miu Home" }} />
                    <Stack.Screen name="register" options={{ title: "Miu Home" }} />
                    <Stack.Screen name="product/[id]" options={{ title: "Miu Home" }} />
                    <Stack.Screen name="cart" options={{ title: "Miu Home" }} />
                    <Stack.Screen name="admin/index" options={{ title: "Miu Admin" }} />
                    <Stack.Screen name="admin/add" options={{ title: "Miu Admin" }} />
                    <Stack.Screen name="admin/stock" options={{ title: "Miu Admin" }} />
                    <Stack.Screen name="admin/order" options={{ title: "Miu Admin" }} />
                </Stack>
            </CartProvider>
        </AuthProvider>
    );
}
