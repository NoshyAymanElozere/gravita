import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { ImageUpload } from '@/components/shared/image-upload'
import { cn } from '@/utils/utils'
import {
    ArrowLeft,
    Trash2,
    ArrowUp,
    ArrowDown,
    Heading,
    AlignLeft,
    Quote,
    Calendar,
    Link2,
    Layers,
    Globe
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBlog, useCreateBlog, useUpdateBlog, uploadBlogImage } from '../api/useBlog'
import type { BlogPost, BlogSection } from '../api/useBlog'
import { useDepartmentList } from '@/features/department/api/useDepartment'
import { useForm, FormProvider } from 'react-hook-form'

export default function BlogForm() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const isEdit = !!slug
    const isRtl = i18n.language === 'ar'

    const { data: blog, isLoading: isFetching } = useBlog(slug || null)

    const createMutation = useCreateBlog()
    const updateMutation = useUpdateBlog()

    const { data: departments = [] } = useDepartmentList()
    const [selectedDeptSlug, setSelectedDeptSlug] = useState<string>('')

    // Language Tab State: 'ar' or 'en'
    const [activeLanguageTab, setActiveLanguageTab] = useState<'ar' | 'en'>('ar')

    // Track active block tabs for Arabic & English content builders
    const [activeArTab, setActiveArTab] = useState<number>(0)
    const [activeEnTab, setActiveEnTab] = useState<number>(0)

    const methods = useForm({
        defaultValues: {
            slug: '',
            coverImage: '',
            authorAvatarUrl: '',
            publishedAt: new Date().toISOString().split('T')[0],

            title: '',
            titleEn: '',
            subtitle: '',
            subtitleEn: '',
            category: 'تطوير البرمجيات',
            categoryEn: 'Software Development',
            author: '',
            authorEn: '',
            readTime: '5 دقائق للقراءة',
            readTimeEn: '5 min read'
        }
    })

    const { reset, handleSubmit, setValue } = methods

    // Sync selected department dropdown when editing a blog
    useEffect(() => {
        if (blog && departments.length > 0) {
            const match = departments.find(
                d => d.name_en === blog.categoryEn || d.name_ar === blog.category
            )
            if (match) {
                setSelectedDeptSlug(match.slug)
            }
        }
    }, [blog, departments])

    const handleDepartmentChange = (slugVal: string) => {
        const match = departments.find(d => d.slug === slugVal)
        if (match) {
            setValue('category', match.name_ar)
            setValue('categoryEn', match.name_en)
            setSelectedDeptSlug(match.slug)
        }
    }

    // State to manage content sections
    const [enSections, setEnSections] = useState<BlogSection[]>([
        { type: 'paragraph', text: '' }
    ])
    const [arSections, setArSections] = useState<BlogSection[]>([
        { type: 'paragraph', text: '' }
    ])

    // Populate form with existing blog data on edit
    useEffect(() => {
        if (isEdit && blog) {
            let parsedDate = new Date().toISOString().split('T')[0]
            if (blog.publishedAt) {
                try {
                    parsedDate = new Date(blog.publishedAt).toISOString().split('T')[0]
                } catch (e) {
                    // ignore
                }
            }

            reset({
                slug: blog.slug || '',
                coverImage: blog.coverImage || '',
                authorAvatarUrl: blog.authorAvatarUrl || '',
                publishedAt: parsedDate,

                title: blog.title || blog.ar?.title || '',
                titleEn: blog.titleEn || blog.en?.title || '',
                subtitle: blog.subtitle || blog.ar?.subtitle || '',
                subtitleEn: blog.subtitleEn || blog.en?.subtitle || '',
                category: blog.category || blog.ar?.category || 'تطوير البرمجيات',
                categoryEn: blog.categoryEn || blog.en?.category || 'Software Development',
                author: blog.author || blog.ar?.authorName || '',
                authorEn: blog.authorEn || blog.en?.authorName || '',
                readTime: blog.readTime || blog.ar?.readTime || '5 دقائق للقراءة',
                readTimeEn: blog.readTimeEn || blog.en?.readTime || '5 min read'
            })

            // Populate English sections
            if (blog.en?.sections) {
                setEnSections(blog.en.sections)
            } else if (blog.content?.sections) {
                setEnSections(blog.content.sections)
            } else {
                setEnSections([{ type: 'paragraph', text: '' }])
            }

            // Populate Arabic sections
            if (blog.ar?.sections) {
                setArSections(blog.ar.sections)
            } else {
                setArSections([{ type: 'paragraph', text: '' }])
            }
            setActiveArTab(0)
            setActiveEnTab(0)
        }
    }, [blog, isEdit, reset])

    // English sections functions
    const addEnSection = (type: 'header' | 'paragraph' | 'quote_card') => {
        const newSections = [...enSections, { type, text: '', tag: type === 'quote_card' ? '' : undefined }]
        setEnSections(newSections)
        setActiveEnTab(newSections.length - 1)
    }
    const removeEnSection = (index: number) => {
        const updated = enSections.filter((_, idx) => idx !== index)
        setEnSections(updated)
        setActiveEnTab(prev => Math.min(Math.max(0, prev), Math.max(0, updated.length - 1)))
    }
    const handleEnSectionTextChange = (index: number, val: string) => {
        const updated = [...enSections]
        updated[index].text = val
        setEnSections(updated)
    }
    const handleEnSectionTagChange = (index: number, val: string) => {
        const updated = [...enSections]
        updated[index].tag = val
        setEnSections(updated)
    }
    const moveEnUp = (index: number) => {
        if (index === 0) return
        const updated = [...enSections]
        const temp = updated[index]
        updated[index] = updated[index - 1]
        updated[index - 1] = temp
        setEnSections(updated)
        if (activeEnTab === index) {
            setActiveEnTab(index - 1)
        } else if (activeEnTab === index - 1) {
            setActiveEnTab(index)
        }
    }
    const moveEnDown = (index: number) => {
        if (index === enSections.length - 1) return
        const updated = [...enSections]
        const temp = updated[index]
        updated[index] = updated[index + 1]
        updated[index + 1] = temp
        setEnSections(updated)
        if (activeEnTab === index) {
            setActiveEnTab(index + 1)
        } else if (activeEnTab === index + 1) {
            setActiveEnTab(index)
        }
    }

    // Arabic sections functions
    const addArSection = (type: 'header' | 'paragraph' | 'quote_card') => {
        const newSections = [...arSections, { type, text: '', tag: type === 'quote_card' ? '' : undefined }]
        setArSections(newSections)
        setActiveArTab(newSections.length - 1)
    }
    const removeArSection = (index: number) => {
        const updated = arSections.filter((_, idx) => idx !== index)
        setArSections(updated)
        setActiveArTab(prev => Math.min(Math.max(0, prev), Math.max(0, updated.length - 1)))
    }
    const handleArSectionTextChange = (index: number, val: string) => {
        const updated = [...arSections]
        updated[index].text = val
        setArSections(updated)
    }
    const handleArSectionTagChange = (index: number, val: string) => {
        const updated = [...arSections]
        updated[index].tag = val
        setArSections(updated)
    }
    const moveArUp = (index: number) => {
        if (index === 0) return
        const updated = [...arSections]
        const temp = updated[index]
        updated[index] = updated[index - 1]
        updated[index - 1] = temp
        setArSections(updated)
        if (activeArTab === index) {
            setActiveArTab(index - 1)
        } else if (activeArTab === index - 1) {
            setActiveArTab(index)
        }
    }
    const moveArDown = (index: number) => {
        if (index === arSections.length - 1) return
        const updated = [...arSections]
        const temp = updated[index]
        updated[index] = updated[index + 1]
        updated[index + 1] = temp
        setArSections(updated)
        if (activeArTab === index) {
            setActiveArTab(index + 1)
        } else if (activeArTab === index + 1) {
            setActiveArTab(index)
        }
    }

    const onSubmit = async (formData: any) => {
        if (enSections.length === 0 || enSections.some(s => !s.text.trim())) {
            alert('Please fill out all English content sections or delete empty ones.')
            return
        }
        if (arSections.length === 0 || arSections.some(s => !s.text.trim())) {
            alert('Please fill out all Arabic content sections or delete empty ones.')
            return
        }

        let finalCoverImage = formData.coverImage
        let finalAuthorAvatarUrl = formData.authorAvatarUrl

        // Handle coverImage upload
        if (formData.coverImage instanceof FileList && formData.coverImage.length > 0) {
            try {
                finalCoverImage = await uploadBlogImage(formData.coverImage[0])
            } catch (err) {
                alert('Failed to upload cover image')
                return
            }
        } else if (formData.coverImage && typeof formData.coverImage === 'object' && formData.coverImage[0]) {
            try {
                finalCoverImage = await uploadBlogImage(formData.coverImage[0])
            } catch (err) {
                alert('Failed to upload cover image')
                return
            }
        }

        // Handle authorAvatarUrl upload
        if (formData.authorAvatarUrl instanceof FileList && formData.authorAvatarUrl.length > 0) {
            try {
                finalAuthorAvatarUrl = await uploadBlogImage(formData.authorAvatarUrl[0])
            } catch (err) {
                alert('Failed to upload author avatar image')
                return
            }
        } else if (formData.authorAvatarUrl && typeof formData.authorAvatarUrl === 'object' && formData.authorAvatarUrl[0]) {
            try {
                finalAuthorAvatarUrl = await uploadBlogImage(formData.authorAvatarUrl[0])
            } catch (err) {
                alert('Failed to upload author avatar image')
                return
            }
        }

        const payload: Partial<BlogPost> = {
            slug: formData.slug.toLowerCase().trim().replace(/\s+/g, '-'),
            coverImage: finalCoverImage,
            authorAvatarUrl: finalAuthorAvatarUrl,
            publishedAt: formData.publishedAt,

            title: formData.title,
            titleEn: formData.titleEn,
            subtitle: formData.subtitle,
            subtitleEn: formData.subtitleEn,
            category: formData.category,
            categoryEn: formData.categoryEn,
            author: formData.author,
            authorEn: formData.authorEn,
            readTime: formData.readTime,
            readTimeEn: formData.readTimeEn,

            sectionsEn: enSections.map(s => ({
                type: s.type,
                text: s.text,
                tag: s.type === 'quote_card' ? s.tag || 'Quote' : undefined
            })),
            sections: arSections.map(s => ({
                type: s.type,
                text: s.text,
                tag: s.type === 'quote_card' ? s.tag || 'Quote' : undefined
            }))
        }

        if (isEdit && blog?.slug) {
            updateMutation.mutate(
                { slug: blog.slug, blogData: payload },
                {
                    onSuccess: () => navigate('/blogs')
                }
            )
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => navigate('/blogs')
            })
        }
    }

    if (isEdit && isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main" />
            </div>
        )
    }

    return (
        <FormProvider {...methods}>
            <div className="space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>

                {/* STICKY CARD ACTIONS HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/40 shadow-xs">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => navigate('/blogs')}
                            className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-zinc-800"
                        >
                            <ArrowLeft className={isRtl ? 'rotate-180 h-5 w-5 text-gray-600' : 'h-5 w-5 text-gray-600'} />
                        </Button>
                        <div>
                            <h1 className="text-xl font-black text-foreground">
                                {isEdit ? (isRtl ? 'تعديل مقال المدونة' : 'Edit Blog Post') : (isRtl ? 'كتابة مقال جديد' : 'Compose Blog Post')}
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isRtl ? 'صمم مقالات غنية وثنائية اللغة بمقاطع مخصصة' : 'Design rich, bilingual posts with modular content blocks'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => navigate('/blogs')}
                            className="rounded-xl h-10 px-5 flex-1 md:flex-none"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit(onSubmit)}
                            loading={createMutation.isPending || updateMutation.isPending}
                            className="bg-main hover:bg-main/90 text-white rounded-xl h-10 px-6 font-bold flex-1 md:flex-none"
                        >
                            {t('save')}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

                    {/* SECTION 1: GLOBAL CONFIGURATION */}
                    <Card className="border-border/40 shadow-xs rounded-3xl overflow-hidden bg-card">
                        <CardHeader className="border-b border-border/30 px-6 py-5">
                            <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
                                <Layers className="h-4.5 w-4.5 text-main" />
                                {t('sharedSettings') || 'Shared Post Configuration'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <BaseInputField
                                        name="slug"
                                        label={t('slugLabel')}
                                        placeholder="key-technology-trends"
                                        required
                                        className="h-10 rounded-xl"
                                    />
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                        <Link2 className="h-3 w-3" />
                                        {isRtl ? 'المعرف الفريد لرابط المقال.' : 'Unique URL slug identifier.'}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <BaseInputField
                                        name="publishedAt"
                                        type="date"
                                        label={t('publishedAtLabel')}
                                        required
                                        className="h-10 rounded-xl"
                                    />
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        {isRtl ? 'تاريخ عرض ونشر المقال.' : 'Official schedule publish date.'}
                                    </span>
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block text-start">
                                        {isRtl ? 'القسم / الإدارة (ربط ديناميكي)' : 'Department / Category (Dynamic Link)'}
                                    </label>
                                    <select
                                        className="w-full h-10 px-3.5 rounded-xl border border-gray-250 bg-white text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-main focus:border-main transition-all"
                                        value={selectedDeptSlug || ''}
                                        onChange={(e) => handleDepartmentChange(e.target.value)}
                                    >
                                        <option value="" disabled>{isRtl ? 'اختر قسم...' : 'Select department...'}</option>
                                        {departments.map((d) => (
                                            <option key={d._id} value={d.slug}>
                                                {d.name_en}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                        {selectedDeptSlug ? (isRtl ? '✓ تم الربط التلقائي للتصنيفات' : '✓ Dynamic category fields synced') : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/30">
                                <ImageUpload
                                    name="coverImage"
                                    label={t('coverImageLabel') || 'Cover Image'}
                                    currentImageUrl={blog?.coverImage}
                                    aspectRatio="h-44 w-full"
                                />
                                <ImageUpload
                                    name="authorAvatarUrl"
                                    label={t('authorAvatarUrlLabel') || 'Author Avatar'}
                                    currentImageUrl={blog?.authorAvatarUrl}
                                    aspectRatio="h-44 w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* MODERN LANGUAGE WORKSPACE TABS SELECTOR */}
                    <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl max-w-lg mx-auto border border-border/40 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setActiveLanguageTab('ar')}
                            className={cn(
                                "flex-1 py-3 px-6 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2",
                                activeLanguageTab === 'ar'
                                    ? "bg-white dark:bg-zinc-700 text-[#192652] dark:text-white shadow-xs scale-[1.02]"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            {isRtl ? 'المحتوى العربي (AR)' : 'Arabic Content (AR)'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLanguageTab('en')}
                            className={cn(
                                "flex-1 py-3 px-6 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2",
                                activeLanguageTab === 'en'
                                    ? "bg-white dark:bg-zinc-700 text-[#192652] dark:text-white shadow-xs scale-[1.02]"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            {isRtl ? 'المحتوى الإنجليزي (EN)' : 'English Content (EN)'}
                        </button>
                    </div>

                    {/* SECTION 2: BILINGUAL FIELDS AS MODERN FOCUSED WORKSPACE */}
                    <div className="space-y-6">

                        {/* TAB 1: ARABIC WORKSPACE */}
                        {activeLanguageTab === 'ar' && (
                            <div className="space-y-6 bg-card p-6 md:p-8 rounded-3xl border border-border/40 shadow-xs animate-fade-in" dir="rtl">
                                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-black text-xs">AR</span>
                                        <h4 className="text-foreground font-black text-base">{t('arabicContentTitle') || 'مساحة تحرير المحتوى العربي'}</h4>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-bold">{isRtl ? 'العربية نشط' : 'Arabic Active'}</span>
                                </div>

                                <div className="space-y-4">
                                    <BaseInputField name="title" label={t('titleArLabel')} required className="h-11 rounded-xl text-base font-bold" />
                                    <BaseInputField name="subtitle" label={t('subtitleArLabel')} required className="h-11 rounded-xl" />
                                    <div className="flex flex-col space-y-1.5 text-start">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-start">
                                            {t('categoryArLabel')}
                                        </label>
                                        <select
                                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-main focus:border-main transition-all"
                                            value={selectedDeptSlug || ''}
                                            onChange={(e) => handleDepartmentChange(e.target.value)}
                                        >
                                            <option value="" disabled>اختر قسم...</option>
                                            {departments.map((d) => (
                                                <option key={d._id} value={d.slug}>
                                                    {d.name_ar}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BaseInputField name="author" label={t('authorArLabel')} placeholder="أحمد حسان" required className="h-11 rounded-xl" />
                                        <BaseInputField name="readTime" label={t('readTimeArLabel')} placeholder="5 دقائق للقراءة" required className="h-11 rounded-xl" />
                                    </div>
                                </div>

                                {/* Dynamic Editor Card for Arabic */}
                                <div className="space-y-4 pt-6 border-t border-border/30">
                                    <div className="bg-slate-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-border/30 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h5 className="text-sm font-black text-foreground">{t('arabicSectionsTitle') || 'أقسام المقال (العربية)'}</h5>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{t('arabicSectionsDesc') || 'أضف كتل المحتوى وعيّن نصوصها'}</p>
                                            </div>
                                        </div>

                                        {/* Dynamic Add Buttons Styled as Modern Switch Tabs */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => addArSection('header')}
                                                className="h-11 rounded-xl text-xs font-black bg-blue-500/10 text-blue-600 hover:bg-blue-500/25 flex items-center justify-center gap-1.5 border border-blue-500/20 transition-all active:scale-95"
                                            >
                                                <Heading className="h-4 w-4" />
                                                {t('addHeadingBtn') || '+ إضافة عنوان فرعي'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addArSection('paragraph')}
                                                className="h-11 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/25 flex items-center justify-center gap-1.5 border border-emerald-500/20 transition-all active:scale-95"
                                            >
                                                <AlignLeft className="h-4 w-4" />
                                                {t('addParagraphBtn') || '+ إضافة فقرة'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addArSection('quote_card')}
                                                className="h-11 rounded-xl text-xs font-black bg-amber-500/10 text-amber-600 hover:bg-amber-500/25 flex items-center justify-center gap-1.5 border border-amber-500/20 transition-all active:scale-95"
                                            >
                                                <Quote className="h-4 w-4" />
                                                {t('addQuoteBtn') || '+ إضافة اقتباس'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tab View Editor Block */}
                                    {arSections.length > 0 ? (
                                        <div className="space-y-4">

                                            {/* Block Tabs Selection */}
                                            <div className="flex items-center gap-2 overflow-x-auto py-2 border-b border-border/40 scrollbar-none">
                                                {arSections.map((sec, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setActiveArTab(idx)}
                                                        className={cn(
                                                            "px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2 border",
                                                            activeArTab === idx
                                                                ? "bg-main border-main text-white shadow-sm scale-105"
                                                                : "bg-slate-50 dark:bg-zinc-800 border-border hover:bg-slate-100 text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {sec.type === 'header' ? (
                                                            <Heading className="h-4 w-4" />
                                                        ) : sec.type === 'quote_card' ? (
                                                            <Quote className="h-4 w-4" />
                                                        ) : (
                                                            <AlignLeft className="h-4 w-4" />
                                                        )}
                                                        <span>{idx + 1}. {sec.type === 'header' ? t('blockTypeHeading') : sec.type === 'quote_card' ? t('blockTypeQuote') : t('blockTypeParagraph')}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Spacious Content Input Workspace */}
                                            {arSections[activeArTab] && (
                                                <div className="p-6 rounded-3xl border border-border bg-[#F9F9FB] dark:bg-zinc-800/10 space-y-5 animate-fade-in shadow-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-main uppercase tracking-wider">
                                                            {t('activeBlockConfig', { number: activeArTab + 1 })}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                disabled={activeArTab === 0}
                                                                onClick={() => moveArUp(activeArTab)}
                                                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                                                            >
                                                                <ArrowUp className="h-4.5 w-4.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={activeArTab === arSections.length - 1}
                                                                onClick={() => moveArDown(activeArTab)}
                                                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                                                            >
                                                                <ArrowDown className="h-4.5 w-4.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeArSection(activeArTab)}
                                                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                                                            >
                                                                <Trash2 className="h-4.5 w-4.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {arSections[activeArTab].type === 'quote_card' && (
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-600 uppercase">{t('quoteAuthor')}</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder={t('quoteAuthorPlaceholder') || 'e.g. Someone'}
                                                                value={arSections[activeArTab].tag || ''}
                                                                onChange={(e) => handleArSectionTagChange(activeArTab, e.target.value)}
                                                                className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs focus:ring-1 focus:ring-main focus:outline-none"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-600 uppercase">{t('blockContentText')}</label>
                                                        <textarea
                                                            required
                                                            rows={12}
                                                            placeholder={t('blockContentPlaceholder') || 'Write content...'}
                                                            value={arSections[activeArTab].text}
                                                            onChange={(e) => handleArSectionTextChange(activeArTab, e.target.value)}
                                                            className="w-full p-5 rounded-2xl border border-border bg-card text-sm focus:ring-1 focus:ring-main focus:outline-none leading-relaxed min-h-[280px]"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center p-12 border border-dashed border-border rounded-3xl bg-slate-50/50">
                                            <p className="text-xs text-muted-foreground">لا يوجد مقاطع مضافة في هذا القسم. اضغط على أزرار الإضافة أعلاه للبدء.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: ENGLISH WORKSPACE */}
                        {activeLanguageTab === 'en' && (
                            <div className="space-y-6 bg-card p-6 md:p-8 rounded-3xl border border-border/40 shadow-xs animate-fade-in" dir="ltr">
                                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-black text-xs">EN</span>
                                        <h4 className="text-foreground font-black text-base">{t('englishContentTitle') || 'English Content Workspace'}</h4>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-bold">{isRtl ? 'الإنجليزية نشط' : 'English Active'}</span>
                                </div>

                                <div className="space-y-4">
                                    <BaseInputField name="titleEn" label={t('titleEnLabel')} required className="h-11 rounded-xl text-base font-bold" />
                                    <BaseInputField name="subtitleEn" label={t('subtitleEnLabel')} required className="h-11 rounded-xl" />
                                    <div className="flex flex-col space-y-1.5 text-start">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-start">
                                            {t('categoryEnLabel')}
                                        </label>
                                        <select
                                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-main focus:border-main transition-all"
                                            value={selectedDeptSlug || ''}
                                            onChange={(e) => handleDepartmentChange(e.target.value)}
                                        >
                                            <option value="" disabled>Select department...</option>
                                            {departments.map((d) => (
                                                <option key={d._id} value={d.slug}>
                                                    {d.name_en}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <BaseInputField name="authorEn" label={t('authorEnLabel')} placeholder="Ahmed Hassan" required className="h-11 rounded-xl" />
                                        <BaseInputField name="readTimeEn" label={t('readTimeEnLabel')} placeholder="5 min read" required className="h-11 rounded-xl" />
                                    </div>
                                </div>

                                {/* Dynamic Editor Card for English */}
                                <div className="space-y-4 pt-6 border-t border-border/30">
                                    <div className="bg-slate-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-border/30 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h5 className="text-sm font-black text-foreground">{t('englishSectionsTitle') || 'Post Content Blocks (EN)'}</h5>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{t('englishSectionsDesc') || 'Configure blocks and write text contents'}</p>
                                            </div>
                                        </div>

                                        {/* Dynamic Add Buttons Styled as Modern Switch Tabs */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => addEnSection('header')}
                                                className="h-11 rounded-xl text-xs font-black bg-blue-500/10 text-blue-600 hover:bg-blue-500/25 flex items-center justify-center gap-1.5 border border-blue-500/20 transition-all active:scale-95"
                                            >
                                                <Heading className="h-4 w-4" />
                                                {t('addHeadingBtn') || 'Add Heading'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addEnSection('paragraph')}
                                                className="h-11 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/25 flex items-center justify-center gap-1.5 border border-emerald-500/20 transition-all active:scale-95"
                                            >
                                                <AlignLeft className="h-4 w-4" />
                                                {t('addParagraphBtn') || 'Add Paragraph'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addEnSection('quote_card')}
                                                className="h-11 rounded-xl text-xs font-black bg-amber-500/10 text-amber-600 hover:bg-amber-500/25 flex items-center justify-center gap-1.5 border border-amber-500/20 transition-all active:scale-95"
                                            >
                                                <Quote className="h-4 w-4" />
                                                {t('addQuoteBtn') || 'Add Quote'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tab View Editor Block for English */}
                                    {enSections.length > 0 ? (
                                        <div className="space-y-4">

                                            {/* Block Tabs Selection */}
                                            <div className="flex items-center gap-2 overflow-x-auto py-2 border-b border-border/40 scrollbar-none">
                                                {enSections.map((sec, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setActiveEnTab(idx)}
                                                        className={cn(
                                                            "px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2 border",
                                                            activeEnTab === idx
                                                                ? "bg-main border-main text-white shadow-sm scale-105"
                                                                : "bg-slate-50 dark:bg-zinc-800 border-border hover:bg-slate-100 text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {sec.type === 'header' ? (
                                                            <Heading className="h-4 w-4" />
                                                        ) : sec.type === 'quote_card' ? (
                                                            <Quote className="h-4 w-4" />
                                                        ) : (
                                                            <AlignLeft className="h-4 w-4" />
                                                        )}
                                                        <span>{idx + 1}. {sec.type === 'header' ? t('blockTypeHeading') : sec.type === 'quote_card' ? t('blockTypeQuote') : t('blockTypeParagraph')}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Spacious Content Input Workspace */}
                                            {enSections[activeEnTab] && (
                                                <div className="p-6 rounded-3xl border border-border bg-[#F9F9FB] dark:bg-zinc-800/10 space-y-5 animate-fade-in shadow-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-main uppercase tracking-wider">
                                                            {t('activeBlockConfig', { number: activeEnTab + 1 })}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                disabled={activeEnTab === 0}
                                                                onClick={() => moveEnUp(activeEnTab)}
                                                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                                                            >
                                                                <ArrowUp className="h-4.5 w-4.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={activeEnTab === enSections.length - 1}
                                                                onClick={() => moveEnDown(activeEnTab)}
                                                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                                                            >
                                                                <ArrowDown className="h-4.5 w-4.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEnSection(activeEnTab)}
                                                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                                                            >
                                                                <Trash2 className="h-4.5 w-4.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {enSections[activeEnTab].type === 'quote_card' && (
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-600 uppercase">{t('quoteAuthor')}</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder={t('quoteAuthorPlaceholder') || 'e.g. Someone'}
                                                                value={enSections[activeEnTab].tag || ''}
                                                                onChange={(e) => handleEnSectionTagChange(activeEnTab, e.target.value)}
                                                                className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs focus:ring-1 focus:ring-main focus:outline-none"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-600 uppercase">{t('blockContentText')}</label>
                                                        <textarea
                                                            required
                                                            rows={12}
                                                            placeholder={t('blockContentPlaceholder') || 'Write content...'}
                                                            value={enSections[activeEnTab].text}
                                                            onChange={(e) => handleEnSectionTextChange(activeEnTab, e.target.value)}
                                                            className="w-full p-5 rounded-2xl border border-border bg-card text-sm focus:ring-1 focus:ring-main focus:outline-none leading-relaxed min-h-[280px]"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center p-12 border border-dashed border-border rounded-3xl bg-slate-50/50">
                                            <p className="text-xs text-muted-foreground">No sections added yet in this workspace. Click add buttons above to start.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Bottom actions representation */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                        <Button type="button" variant="outline" onClick={() => navigate('/blogs')} className="rounded-xl h-11 px-6">
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-main hover:bg-main/90 text-white rounded-xl h-11 px-8 font-bold"
                        >
                            {t('save')}
                        </Button>
                    </div>

                </form>
            </div>
        </FormProvider>
    )
}
