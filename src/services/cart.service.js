const API_URL = "http://localhost:5000/api/cart"

const cartService = {

    // ДОДАТИ
    add: async (productLink, quantity, price) => {
        try {
            const res = await fetch(`${API_URL}/add`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productLink,
                    quantity,
                    price
                })
            })

            return await res.json()
        } catch (e) {
            console.error("Cart add error:", e)
            return null
        }
    },

    // ОНОВИТИ
    update: async (productLink, quantity, price) => {
        try {
            const res = await fetch(`${API_URL}/update`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productLink,
                    quantity,
                    price
                })
            })

            return await res.json()
        } catch (e) {
            console.error("Cart update error:", e)
            return null
        }
    },

    // ВИДАЛИТИ
    remove: async (productLink) => {
        try {
            const res = await fetch(`${API_URL}/remove`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ productLink })
            })

            return await res.json()
        } catch (e) {
            console.error("Cart remove error:", e)
            return null
        }
    },

    // ОТРИМАТИ
    get: async () => {
        try {
            const res = await fetch(`${API_URL}`, {
                method: "GET",
                credentials: "include",
            })

            return await res.json()
        } catch (e) {
            console.error("Cart get error:", e)
            return null
        }
    },

    // ОНОВИТИ STEP
    updateStep: async (step) => {
        try {
            const res = await fetch(`${API_URL}/update-step`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productLink: "__checkout__", // технічний item
                    step
                })
            })

            return await res.json()
        } catch (e) {
            console.error("Cart update-step error:", e)
            return null
        }
    }
}

export default cartService
