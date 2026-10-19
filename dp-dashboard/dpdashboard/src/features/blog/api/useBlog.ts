import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/axios'
import toast from 'react-hot-toast'

export interface BlogSection {
    type: 'header' | 'paragraph' | 'quote_card'
    text: string
    tag?: string
}

export interface BlogAuthor {
    name: string
    avatarUrl: string
}

export interface BlogPost {
    _id?: string
    id?: string // fallback
    slug: string
    category: string
    categoryEn?: string
    title: string
    titleEn?: string
    subtitle: string
    subtitleEn?: string
    coverImage: string
    author: any // Can be string or BlogAuthor
    authorEn?: string
    readTime: string
    readTimeEn?: string
    publishedAt?: string
    content: {
        sections: BlogSection[]
    }
    sections?: BlogSection[]
    sectionsEn?: BlogSection[]
    createdAt?: string
    updatedAt?: string
    authorAvatarUrl?: string
    en?: {
        title: string
        subtitle: string
        category: string
        coverImage?: string
        authorName: string
        authorAvatarUrl?: string
        readTime: string
        publishedAt?: string
        sections: BlogSection[]
    }
    ar?: {
        title: string
        subtitle: string
        category: string
        coverImage?: string
        authorName: string
        authorAvatarUrl?: string
        readTime: string
        publishedAt?: string
        sections: BlogSection[]
    }
}

export function useBlogList() {
    return useQuery({
        queryKey: ['blog-list'],
        queryFn: async () => {
            const response = await api.get('/blogs')
            return response.data.data as BlogPost[]
        }
    })
}

export function useBlog(slug: string | null) {
    return useQuery({
        queryKey: ['blog', slug],
        queryFn: async () => {
            const response = await api.get(`/blogs/${slug}`)
            return response.data.data as BlogPost
        },
        enabled: !!slug
    })
}

export function useCreateBlog() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (blogData: Partial<BlogPost>) => {
            const response = await api.post('/blogs', blogData)
            return response.data
        },
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['blog-list'] })
            toast.success(res.message || 'Blog post created successfully.')
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to create blog post.')
        }
    })
}

export function useUpdateBlog() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ slug, blogData }: { slug: string; blogData: Partial<BlogPost> }) => {
            const response = await api.put(`/blogs/${slug}`, blogData)
            return response.data
        },
        onSuccess: (res, variables) => {
            qc.invalidateQueries({ queryKey: ['blog-list'] })
            qc.invalidateQueries({ queryKey: ['blog', variables.slug] })
            toast.success(res.message || 'Blog post updated successfully.')
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to update blog post.')
        }
    })
}

export function useDeleteBlog() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (slug: string) => {
            const response = await api.delete(`/blogs/${slug}`)
            return response.data
        },
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['blog-list'] })
            toast.success(res.message || 'Blog post deleted successfully.')
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to delete blog post.')
        }
    })
}

export async function uploadBlogImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/blogs/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data.url
}
