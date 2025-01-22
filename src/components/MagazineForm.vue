<!-- MagazineForm.vue -->
<script setup>
import { ref, computed } from 'vue';
// Import images
const thumbnailSrc = '/src/assets/images/thumbnail-switch.jpg';

const formData = ref({
    orderType: 'einzelausgabe',
    quantity: 1,
    selection: '',
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    zipCode: '',
    city: '',
    country: 'Belgien',
    agreeToTerms: false
});

const errors = ref({});

// Prices
const SINGLE_PRICE = 11.50;
const SUBSCRIPTION_PRICE = 53.40;

// Computed total price based on selection and quantity
const totalPrice = computed(() => {
    const basePrice = formData.value.orderType === 'einzelausgabe'
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

    if (!formData.value.firstName.trim()) {
        errors.value.firstName = 'Vorname ist erforderlich';
    }

    if (!formData.value.lastName.trim()) {
        errors.value.lastName = 'Nachname ist erforderlich';
    }

    if (!formData.value.email.trim()) {
        errors.value.email = 'E-Mail ist erforderlich';
    } else if (!isValidEmail(formData.value.email)) {
        errors.value.email = 'Ungültige E-Mail-Adresse';
    }

    if (!formData.value.street.trim()) {
        errors.value.street = 'Straße ist erforderlich';
    }

    if (!formData.value.zipCode.trim()) {
        errors.value.zipCode = 'PLZ ist erforderlich';
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
            // Here you would typically send the data to your backend
            console.log('Form submitted:', formData.value);
            // Emit event to parent component
            emit('form-submitted', formData.value);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }
};
</script>

<template>
    <form @submit="handleSubmit" class="max-w-xl mx-auto space-y-4">
        <!-- Order Type Selection with Images -->
        <div class="flex flex-col md:flex-row gap-8 justify-center">
            <!-- Option 1: Einzelausgabe -->
            <div class="flex-1 max-w-sm">
                <div class="flex items-center mb-4">
                    <input type="radio" id="einzelausgabe" v-model="formData.orderType" value="einzelausgabe" class="mr-2" />
                    <label for="einzelausgabe">Als Einzelausgabe</label>
                </div>
                <img :src="thumbnailSrc" alt="Switch - Ausgabe 83" class="w-full mb-2" />
                <div class="text-sm">
                    <p class="font-bold">Switch - Ausgabe 83</p>
                    <p>11,50 €</p>
                    <p class="text-gray-600">inkl. 19% MwSt.</p>
                </div>
            </div>

            <!-- Option 2: Miniabo -->
            <div class="flex-1 max-w-sm">
                <div class="flex items-center mb-4">
                    <input type="radio" id="miniabo" v-model="formData.orderType" value="miniabo" class="mr-2" />
                    <label for="miniabo">Als Miniabo</label>
                </div>
                <img :src="thumbnailSrc" alt="Switch + 5 Folgeausgaben" class="w-full mb-2" />
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
                <p class="text-sm text-gray-500" v-if="formData.orderType === 'miniabo'">
                    (6 Ausgaben, zahlbar im Voraus)
                </p>
            </div>
        </div>

        <!-- Selection Dropdown -->
        <select v-model="formData.selection" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.selection }">
            <option value="">Auswahl</option>
            <!-- Add your options here -->
        </select>

        <!-- Personal Information -->
        <input type="text" v-model="formData.firstName" placeholder="Vorname" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.firstName }" />
        <span v-if="errors.firstName" class="text-red-500 text-sm">{{ errors.firstName }}</span>

        <input type="text" v-model="formData.lastName" placeholder="Nachname" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.lastName }" />
        <span v-if="errors.lastName" class="text-red-500 text-sm">{{ errors.lastName }}</span>

        <input type="email" v-model="formData.email" placeholder="E-Mail" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.email }" />
        <span v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</span>

        <!-- Address -->
        <input type="text" v-model="formData.street" placeholder="Strasse" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.street }" />
        <span v-if="errors.street" class="text-red-500 text-sm">{{ errors.street }}</span>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <input type="text" v-model="formData.zipCode" placeholder="PLZ" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.zipCode }" />
                <span v-if="errors.zipCode" class="text-red-500 text-sm">{{ errors.zipCode }}</span>
            </div>
            <div>
                <input type="text" v-model="formData.city" placeholder="Stadt" class="w-full p-2 border rounded" :class="{ 'border-red-500': errors.city }" />
                <span v-if="errors.city" class="text-red-500 text-sm">{{ errors.city }}</span>
            </div>
        </div>

        <!-- Country Selection -->
        <select v-model="formData.country" class="w-full p-2 border rounded">
            <option value="Belgien">Belgien</option>
            <!-- Add more countries as needed -->
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