const API = "http://localhost:5000/api/cart"

const cartService = {
    async add(productId, quantity = 1) {
        return fetch(`${API}/add`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity })
        }).then(res => res.json())
    },

    async update(productId, quantity) {
        return fetch(`${API}/update`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity })
        }).then(res => res.json())
    },

    async remove(productId) {
        return fetch(`${API}/remove`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId })
        }).then(res => res.json())
    },

    // ⬇⬇⬇ ВАЖЛИВО! МЕТОД GET КОРЗИНИ
    async get() {
        return fetch(`${API}`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        }).then(res => res.json())
    }
}

export default cartService
