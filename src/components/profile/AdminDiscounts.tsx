import React, { useEffect, useRef, useState } from 'react'
import { useCollection } from 'react-firebase-hooks/firestore'
import { collection, setDoc, doc, updateDoc, deleteDoc, increment, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../firebase'
import { TrashIcon } from 'lucide-react'
import SearchBar from './SearchBar'
import AdminDiscountsTable from './AdminDiscountsTable'
import type { EventFCA, Program } from '@/types/programs'

export default function AdminDiscounts() {
    const [events, setEvents] = useState<EventFCA[]>([])
    const [programs, setPrograms] = useState<Program[]>([])
    const [discounts, setDiscounts] = useState<any[]>([])
    const [filteredDiscounts, setFilteredDiscounts] = useState<any[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [form, setForm] = useState({
        name: "",
        code: "",
        discount: 0,
        productId: "",
        disable: false,
        createdAt: new Date(),
    })
    const [eventsValue, eventsLoading, eventsError] = useCollection(collection(db, "events"));
    const [programsValue, programsLoading, programsError] = useCollection(collection(db, "programs"));
    const [discountsValue, discountsLoading, discountsError] = useCollection(collection(db, "discounts"));

    useEffect(() => {
        if (eventsValue) {
            setEvents(eventsValue.docs.map(doc => doc.data() as EventFCA))
        }
        if (programsValue) {
            setPrograms(programsValue.docs.map(doc => doc.data() as Program))
        }
        if (discountsValue) {
            setDiscounts(discountsValue.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate()
                }
            }))
        }
    }, [eventsValue, programsValue, discountsValue])

    useEffect(() => {
        setFilteredDiscounts(discounts)
    }, [discounts])

    const handleNameSearch = (searchTerm: string) => {
        if (!searchTerm?.trim()) {
            setFilteredDiscounts(discounts)
            return
        }
        const searchTermLower = searchTerm.toLowerCase().trim()
        const filtered = discounts.filter(discount =>
            discount.name?.toLowerCase().includes(searchTermLower)
        )
        setFilteredDiscounts(filtered)
    }

    const handleProductSearch = (searchTerm: string) => {
        if (!searchTerm?.trim()) {
            setFilteredDiscounts(discounts)
            return
        }
        const searchTermLower = searchTerm.toLowerCase().trim()
        const filtered = discounts.filter(discount => {
            const product = [...events, ...programs].find(p => p.id === discount.productId)
            if (!product) return false
            const productName = 'title' in product ? product.title : product.name
            return productName?.toLowerCase().includes(searchTermLower)
        })
        setFilteredDiscounts(filtered)
    }

    const handleCreateDiscount = async (e: any) => {
        e.preventDefault()
        const discountRef = doc(collection(db, "discounts"))
        await setDoc(
            discountRef,
            {
                name: form.name.toUpperCase().trim(),
                code: form.code.toUpperCase().trim(),
                discount: form.discount,
                productId: form.productId,
                disable: false,
                timesUsed: 0,
                createdAt: new Date(),
            }
        )
        alert("Descuento creado exitosamente")
        setIsCreating(false)
    }   

    const handleDisable = async (id: string) => {
        const discountRef = doc(collection(db, "discounts"), id)
        await updateDoc(
            discountRef,
            {
                disable: true,
            }
        )
    }

    const handleEnable = async (id: string) => {
        const discountRef = doc(collection(db, "discounts"), id)
        await updateDoc(
            discountRef,
            {
                disable: false,
            }
        )
    }

    const handleDelete = async (id: string) => {
        const discountRef = doc(collection(db, "discounts"), id)
        await deleteDoc(discountRef)
    }

    const getProductTitle = (productId: string): string => {
        const event = events.find(e => e.id === productId)
        if (event && event.title) return event.title

        const program = programs.find(p => p.slug === productId)
        if (program && program.name) return program.name

        return 'Producto no encontrado'
    }

    const futureEvents = () => {
        const now = new Date();
        const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
        return events.filter((e: EventFCA) => e.date && new Date(e.date) > colombiaTime);
    }
    
    return (
        <div className="px-4 sm:px-6 w-full lg:px-8 py-8">
            <div className="flex flex-col gap-8">
                {
                    isCreating && (
                        <div className="w-full lg:max-w-lg lg:mx-auto lg:w-full">
                            <form action="" className="bg-white rounded-xl shadow-md border p-6 space-y-6 top-8 flex flex-col gap-">
                                <h2 className="text-2xl text-center font-semibold text-gray-800 mb-6">Crear Descuento</h2>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                                        type="text"
                                        placeholder="Ej: Descuento Verano 2025"
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                    <label className="block text-sm font-medium text-gray-700">Código</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                                        type="text"
                                        placeholder="Ej: VERANO2025"
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Descuento (%)</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                                        type="number"
                                        placeholder="10000"
                                        onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Producto</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                                        onChange={(e) => setForm({ ...form, productId: e.target.value })}
                                    >
                                        <option value="">Seleccionar producto</option>
                                        {[...futureEvents(), ...programs].map((item: any) =>
                                            <option key={item.id} value={item.id || item.slug}>
                                                {item.title || item.name}
                                            </option>
                                        )}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blueApp text-white py-2.5 px-4 rounded-lg hover:bg-blueApp/80 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blueApp            focus:ring-opacity-50 font-medium text-sm shadow-sm"
                                    onClick={(e) => handleCreateDiscount(e)}
                                >
                                    Crear Descuento
                                </button>
                                <button onClick={() => setIsCreating(false)} className="w-full  bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 font-medium text-sm shadow-sm">Cancelar</button>
                            </form>
                        </div>
                    )
                }
                {
                    !isCreating &&
                    <div className="flex-grow w-full">
                        <SearchBar onNameSearch={handleNameSearch} onProductSearch={handleProductSearch} setIsCreating={setIsCreating} />
                        <div className="bg-white rounded-md shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <AdminDiscountsTable filteredDiscounts={filteredDiscounts} handleDisable={handleDisable} handleEnable={handleEnable} handleDelete={handleDelete} getProductTitle={getProductTitle} />
                            </div>
                        </div>
                    </div>
                }

            </div>
        </div>
    )
}