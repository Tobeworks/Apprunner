<script setup>
import { ref, onMounted } from 'vue';

const users = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
    try {
        const response = await fetch('https://rytjazkk4r.eu-central-1.awsapprunner.com/get-covercard-user');
        const data = await response.json();
        if (data.status === 'success') {
            users.value = data.users;
        } else {
            throw new Error('Data fetch was not successful');
        }
    } catch (e) {
        error.value = 'Failed to load users';
    } finally {
        loading.value = false;
    }
});

// Status-Farben Mapping
const getStatusColor = (status) => {
    const colors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-green-100 text-green-800',
        'Created': 'bg-blue-100 text-blue-800',
        'Refunded': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};
</script>

<template>
    <div class="p-4">
        <div v-if="loading" class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>

        <div v-else-if="error" class="text-red-500 text-center py-4">
            {{ error }}
        </div>

        <div v-else class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {{ user.id }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ user.email }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                                getStatusColor(user.status)
                            ]">
                                {{ user.status }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>