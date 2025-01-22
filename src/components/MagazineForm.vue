<!-- MagazineForm.vue -->
<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';


const formData = ref({
    order_type: 'einzelausgabe',
    quantity: 1,
    selection: '',
    first_name: '',
    last_name: '',
    email: '',
    street: '',
    zip_code: '',
    city: '',
    country: 'DE',
    agreeToTerms: false
});

const errors = ref({});

// Prices
const SINGLE_PRICE = 11.50;
const SUBSCRIPTION_PRICE = 53.40;


const totalPrice = computed(() => {
    const basePrice = formData.value.order_type === 'einzelausgabe'
        ? SINGLE_PRICE
        : SUBSCRIPTION_PRICE;
    return (basePrice * formData.value.quantity).toFixed(2);
});

// Quantity handlers
const increaseQuantity = () => {
    formData.value.quantity++;
};

const decreaseQuantity = () => {
    if (formData.value.quantity > 1) {
        formData.value.quantity--;
    }
};

// Form validation
const validateForm = () => {
    errors.value = {};

    if (!formData.value.first_name.trim()) {
        errors.value.first_name = 'Vorname ist erforderlich';
    }

    if (!formData.value.last_name.trim()) {
        errors.value.last_name = 'Nachname ist erforderlich';
    }

    if (!formData.value.email.trim()) {
        errors.value.email = 'E-Mail ist erforderlich';
    } else if (!isValidEmail(formData.value.email)) {
        errors.value.email = 'Ungültige E-Mail-Adresse';
    }

    if (!formData.value.street.trim()) {
        errors.value.street = 'Straße ist erforderlich';
    }

    if (!formData.value.zip_code.trim()) {
        errors.value.zip_code = 'PLZ ist erforderlich';
    }

    if (!formData.value.city.trim()) {
        errors.value.city = 'Stadt ist erforderlich';
    }

    if (!formData.value.agreeToTerms) {
        errors.value.agreeToTerms = 'Bitte akzeptieren Sie die AGB und Datenschutzerklärung';
    }

    return Object.keys(errors.value).length === 0;
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
        try {
            // Calculate total price
            const basePrice = formData.value.order_type === 'einzelausgabe' ? 11.50 : 53.40;
            const totalPrice = basePrice * formData.value.quantity;

            const isDev = import.meta.env.DEV; // will be true in development, false in production
            const endpoint = isDev
                ? 'http://localhost:8080/save-customer-order'
                : 'https://rytjazkk4r.eu-central-1.awsapprunner.com/save-customer-order'; 

            const response = await axios.post(endpoint, {
                order_type: formData.value.order_type,       // camelCase for server validation
                quantity: formData.value.quantity,
                first_name: formData.value.first_name,
                last_name: formData.value.last_name,
                email: formData.value.email,
                street: formData.value.street,
                zip_code: formData.value.zip_code,
                city: formData.value.city,
                country: formData.value.country,
                agreeToTerms: formData.value.agreeToTerms,
                totalPrice: totalPrice
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 'success') {
                console.log('Order saved successfully:', response.data);
                alert(`Bestellung erfolgreich aufgegeben!\nBestellnummer: ${response.data.order_id}\nGesamtpreis: ${totalPrice.toFixed(2)} €`);
            }
        } catch (error) {
            console.error('Error details:', error.response?.data);
            let errorMessage = 'Ein Fehler ist aufgetreten';

            if (error.response?.data?.message) {
                if (error.response.data.message.includes('required field')) {
                    errorMessage = error.response.data.message;
                }
            }
            alert(errorMessage);
        }
    }
};
</script>

<template>
    <form @submit="handleSubmit" class="max-w-xl mx-auto space-y-4" >
        <!-- Order Type Selection with Images -->
        <div class="flex flex-col md:flex-row gap-8 justify-center">
            <!-- Option 1: Einzelausgabe -->
            <div class="flex-1 max-w-sm">
                <div class="flex items-center mb-4">
                    <input type="radio" id="einzelausgabe" v-model="formData.order_type" value="einzelausgabe" class="mr-2" />
                    <label for="einzelausgabe">Als Einzelausgabe</label>
                </div>
                <img src="images/magazines/33.jpg" alt="Switch - Ausgabe 83" class="w-full mb-2" />
                <div class="text-sm">
                    <p class="font-bold">Switch - Ausgabe 83</p>
                    <p>11,50 €</p>
                    <p class="text-gray-600">inkl. 19% MwSt.</p>
                </div>
            </div>

            <!-- Option 2: Miniabo -->
            <div class="flex-1 max-w-sm">
                <div class="flex items-center mb-4">
                    <input type="radio" id="miniabo" v-model="formData.order_type" value="miniabo" class="mr-2" />
                    <label for="miniabo">Als Miniabo</label>
                </div>
                <img src="images/magazines/33.jpg" alt="Switch + 5 Folgeausgaben" class="w-full mb-2" />
                <div class="text-sm">
                    <p class="font-bold">Switch + 5 Folgeausgaben</p>
                    <p>53,40 €</p>
                    <p class="text-gray-600">inkl. 19% MwSt.</p>
                </div>
            </div>
        </div>

        <!-- Quantity Selector and Price -->
        <div class="flex justify-center items-center gap-4 mt-8">
            <div class="flex items-center">
                <span class="mr-4 text-sm font-medium">Mengenangabe:</span>
                <button type="button" @click="decreaseQuantity" class="px-3 py-1 border rounded-l hover:bg-gray-100">
                    -
                </button>
                <input type="number" v-model="formData.quantity" class="w-16 text-center border-t border-b" min="1" />
                <button type="button" @click="increaseQuantity" class="px-3 py-1 border rounded-r hover:bg-gray-100">
                    +
                </button>
            </div>
            <div class="ml-8">
                <p class="flex items-baseline">
                    <span class="text-xl font-bold">{{ totalPrice }} €</span>
                    <span class="ml-2 text-sm text-gray-600">inkl. 19% MwSt.</span>
                </p>
                <p class="text-sm text-gray-500" v-if="formData.order_type === 'miniabo'">
                    (6 Ausgaben, zahlbar im Voraus)
                </p>
            </div>
        </div>

        <!-- Selection Dropdown -->
        <select v-model="formData.selection" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.selection }">
            <option value="">Auswahl</option>
            <option value="Frau">Frau</option>
            <option value="Herr">Herr</option>
        </select>

        <!-- Personal Information -->
        <input type="text" v-model="formData.first_name" placeholder="Vorname" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.first_name }" />
        <span v-if="errors.first_name" class="text-red-500 text-sm">{{ errors.first_name }}</span>

        <input type="text" v-model="formData.last_name" placeholder="Nachname" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.last_name }" />
        <span v-if="errors.last_name" class="text-red-500 text-sm">{{ errors.last_name }}</span>

        <input type="email" v-model="formData.email" placeholder="E-Mail" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.email }" />
        <span v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</span>

        <!-- Address -->
        <input type="text" v-model="formData.street" placeholder="Strasse" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.street }" />
        <span v-if="errors.street" class="text-red-500 text-sm">{{ errors.street }}</span>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <input type="text" v-model="formData.zip_code" placeholder="PLZ" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.zip_code }" />
                <span v-if="errors.zip_code" class="text-red-500 text-sm">{{ errors.zip_code }}</span>
            </div>
            <div>
                <input type="text" v-model="formData.city" placeholder="Stadt" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.city }" />
                <span v-if="errors.city" class="text-red-500 text-sm">{{ errors.city }}</span>
            </div>
        </div>

        <!-- Country Selection -->
        <select v-model="formData.country" class="w-full p-2 border rounded">
            <option value="BE">Belgien</option>
            <option value="DE" selected>Deutschland</option>
            <option value="DK">Dänemark</option>
            <option value="LU">Luxenburg</option>
            <option value="ES">Spanien</option>
            <option value="GB">Verein. Königreich</option>
            <option value="IT">Italien</option>
            <option value="CH">Schweiz</option>
            <option value="NL">Niederlande</option>
            <option value="AUT">Österreich</option>
        </select>

        <!-- Terms Agreement -->
        <div class="flex items-center gap-2">
            <input type="checkbox" id="agb" v-model="formData.agreeToTerms" class="rounded" :class="{ 'border-red-500': errors.agreeToTerms }" />
            <label for="agb" class="text-sm">
                Ich habe die <a href="#" class="underline">AGB's</a> und
                <a href="#" class="underline">Datenschutzerklärung</a> gelesen
                und akzeptiere diese
            </label>
        </div>
        <span v-if="errors.agreeToTerms" class="text-red-500 text-sm">{{ errors.agreeToTerms }}</span>

        <!-- Submit Button -->
        <div class="text-right">
            <button type="submit" class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                Weiter zur Bezahlung
            </button>
        </div>
    </form>
</template>