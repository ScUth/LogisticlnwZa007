"use client"

import { Boxes, BusFront, Fullscreen, LayoutDashboard, Package, Truck, User, Warehouse, ArrowLeft, Download, Users } from "lucide-react"
import Sidebar, { SidebarItem, SubSidebarItem } from "@/components/AdminSidebar"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { format } from 'date-fns'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://kumtho.trueddns.com:33862";

export default function PODetail() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const proofId = searchParams.get('id')
    
    const [proof, setProof] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        if (proofId) {
            fetchProofDetail()
        } else {
            setError('No proof ID provided')
            setLoading(false)
        }
    }, [proofId])

    const fetchProofDetail = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_BASE_URL}/api/admin/pods/${proofId}`, { 
                credentials: 'include' 
            })
            if (!res.ok) throw new Error('Failed to fetch proof details')
            const data = await res.json()
            setProof(data.proof)
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = (url, filename) => {
        const link = document.createElement('a')
        link.href = url
        link.download = filename || 'proof-image.jpg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const openFullscreen = (url) => {
        setSelectedImage(url)
        setIsFullscreen(true)
    }

    const closeFullscreen = () => {
        setSelectedImage(null)
        setIsFullscreen(false)
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<LayoutDashboard />} text="Dashboard" onClick={() => router.push('/admin/dashboard')}/>
                <SidebarItem icon={<Warehouse />} text="Hub Management" onClick={() => router.push('/admin/management/hub')}/>
                <SidebarItem icon={<Users />} text="Staff Management" onClick={() => router.push('/admin/management/staff/list')} />
                <SidebarItem icon={<User />} text="Record" onClick={() => router.push('/admin/management/records')}/>
                <SidebarItem icon={<Package />} text="Parcel Management" onClick={() => router.push('/admin/management/parcel')}/>
                <SidebarItem icon={<BusFront />} text="Route Management" onClick={() => router.push('/admin/management/route')}/>
                <SidebarItem icon={<Truck />} text="Courier Management" onClick={() => router.push('/admin/management/courier')}/>
                <SidebarItem icon={<Boxes />} text="Scan Event Management" onClick={() => router.push('/admin/management/scan_event')}/>
                <SidebarItem icon={<Fullscreen />} text="Proof of Delivery Management" active/>
                <SubSidebarItem text="Proof of Delivery List" onClick={() => router.push('/admin/management/pod/list')}/>
                <SubSidebarItem text="Proof of Delivery Detail" active/>
            </Sidebar>
            
            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => router.push('/admin/management/pod/list')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to List
                    </button>
                </div>

                <div className="font-semibold text-[30px] mb-6">Proof of Delivery Details</div>

                {loading && <div className="text-gray-500">Loading proof details...</div>}
                {error && <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>}
                
                {!loading && proof && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600">Recipient Name</label>
                                    <div className="font-medium">{proof.recipient_name}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Signed At</label>
                                    <div className="font-medium">
                                        {proof.signed_at ? format(new Date(proof.signed_at), 'PPpp') : '-'}
                                    </div>
                                </div>
                                {proof.recipient_info && (
                                    <>
                                        <div>
                                            <label className="text-sm text-gray-600">Recipient Phone</label>
                                            <div className="font-medium">{proof.recipient_info.phone}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Delivery Address</label>
                                            <div className="font-medium">
                                                {proof.recipient_info.address_text}, {proof.recipient_info.sub_district}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Courier & Parcel Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Courier & Parcel Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {proof.courier && (
                                    <div>
                                        <label className="text-sm text-gray-600">Courier</label>
                                        <div className="font-medium">
                                            {proof.courier.first_name} {proof.courier.last_name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ID: {proof.courier.employee_id} | Phone: {proof.courier.phone}
                                        </div>
                                    </div>
                                )}
                                {proof.parcel && (
                                    <div>
                                        <label className="text-sm text-gray-600">Parcel</label>
                                        <div className="font-medium">
                                            Tracking: {proof.parcel.tracking_code}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Status: {proof.parcel.status} | 
                                            Created: {proof.parcel.created_at ? format(new Date(proof.parcel.created_at), 'PP') : '-'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Proof Images</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Photo URL */}
                                {proof.photo_url ? (
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600">Delivery Photo</label>
                                        <div 
                                            className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => openFullscreen(proof.photo_url)}
                                        >
                                            <img 
                                                src={proof.photo_url} 
                                                alt="Delivery photo" 
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                                Click to enlarge
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(proof.photo_url, `delivery-photo-${proof._id}.jpg`)}
                                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download Photo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600">Delivery Photo</label>
                                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <div className="text-gray-400">No photo available</div>
                                        </div>
                                    </div>
                                )}

                                {/* Signature URL */}
                                {proof.signature_url ? (
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600">Recipient Signature</label>
                                        <div 
                                            className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => openFullscreen(proof.signature_url)}
                                        >
                                            <img 
                                                src={proof.signature_url} 
                                                alt="Recipient signature" 
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                                Click to enlarge
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(proof.signature_url, `signature-${proof._id}.jpg`)}
                                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download Signature
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600">Recipient Signature</label>
                                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <div className="text-gray-400">No signature available</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes Section */}
                        {proof.notes && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
                                <div className="p-4 bg-gray-50 rounded">
                                    <p className="text-gray-700 whitespace-pre-wrap">{proof.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Fullscreen Modal */}
                {isFullscreen && selectedImage && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                        onClick={closeFullscreen}
                    >
                        <div className="relative max-w-4xl max-h-[90vh]">
                            <img 
                                src={selectedImage} 
                                alt="Fullscreen preview" 
                                className="max-w-full max-h-[90vh] object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={closeFullscreen}
                                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDownload(selectedImage, `fullscreen-${Date.now()}.jpg`)}
                                className="absolute top-4 right-16 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}