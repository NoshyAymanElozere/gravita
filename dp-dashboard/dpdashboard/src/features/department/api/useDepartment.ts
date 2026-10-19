import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface Department {
    _id?: string
    name_ar: string
    name_en: string
    slug: string
    name?: string
    createdAt?: string
    updatedAt?: string
}

export function useDepartmentList() {
    return useQuery({
        queryKey: ['department-list'],
        queryFn: async () => {
            const response = await api.get('/departments')
            return response.data.data as Department[]
        }
    })
}

export function useDepartment(slug: string | null) {
    return useQuery({
        queryKey: ['department', slug],
        queryFn: async () => {
            const response = await api.get(`/departments/${slug}`)
            return response.data.data as Department
        },
        enabled: !!slug
    })
}

export function useCreateDepartment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (deptData: Partial<Department>) => {
            const response = await api.post('/departments', deptData)
            return response.data
        },
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['department-list'] })
            toast.success(res.message || 'Department created successfully.')
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to create department.')
        }
    })
}

export function useUpdateDepartment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ slug, deptData }: { slug: string; deptData: Partial<Department> }) => {
            const response = await api.put(`/departments/${slug}`, deptData)
            return response.data
        },
        onSuccess: (res, variables) => {
            qc.invalidateQueries({ queryKey: ['department-list'] })
            qc.invalidateQueries({ queryKey: ['department', variables.slug] })
            toast.success(res.message || 'Department updated successfully.')
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to update department.')
        }
    })
}

export function useDeleteDepartment() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (slug: string) => {
            const response = await api.delete(`/departments/${slug}`)
            return response.data
        },
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['department-list'] })
            toast.success(res.message || 'Department deleted successfully.')
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to delete department.')
        }
    })
}
