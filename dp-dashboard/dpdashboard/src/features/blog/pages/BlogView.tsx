import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useBlog, type BlogSection } from '../api/useBlog'
import { useDepartmentList } from '@/features/department/api/useDepartment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BaseInputField } from '@/components/shared/base-input-field'
import { ImageUpload } from '@/components/shared/image-upload'
import {
    ArrowLeft,
    Pencil,
    Layers,
    Globe,
    Heading,
    AlignLeft,
    Quote,
    ArrowUp,
    ArrowDown,
    Link2,
    Calendar
} from 'lucide-react'
import { cn } from '@/utils/utils'

export default function BlogView() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const { data: blog, isLoading, isError } = useBlog(slug || null)

    const { data: departments = [] } = useDepartmentList()
    const [selectedDeptSlug, setSelectedDeptSlug] = useState<string>('')

    const isRtl = i18n.language === 'ar'

    // Form provider setup
    const methods = useForm({
        defaultValues: {
            slug: '',
            coverImage: '',
            authorAvatarUrl: '',
            publishedAt: '',
            title: '',
            titleEn: '',
            subtitle: '',
            subtitleEn: '',
            category: '',
            categoryEn: '',
            author: '',
            authorEn: '',
            readTime: '',
            readTimeEn: ''
        }
    })

    const { reset } = methods

    // Active workspace configuration (AR / EN tabs)
    const [activeLanguageTab, setActiveLanguageTab] = useState<'ar' | 'en'>('ar')

    // Section indexes
    const [arSections, setArSections] = useState<BlogSection[]>([])
    const [enSections, setEnSections] = useState<BlogSection[]>([])
    const [activeArTab, setActiveArTab] = useState<number>(0)
    const [activeEnTab, setActiveEnTab] = useState<number>(0)

    // Load data into react-hook-form
    useEffect(() => {
        if (blog) {
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
                category: blog.category || blog.ar?.category || '',
                categoryEn: blog.categoryEn || blog.en?.category || '',
                author: blog.author || blog.ar?.authorName || '',
                authorEn: blog.authorEn || blog.en?.authorName || '',
                readTime: blog.readTime || blog.ar?.readTime || '',
                readTimeEn: blog.readTimeEn || blog.en?.readTime || ''
            })

            // Populate mock sections
            if (blog.ar?.sections) {
                setArSections(blog.ar.sections)
            } else {
                setArSections([])
            }

            if (blog.en?.sections) {
                setEnSections(blog.en.sections)
            } else if (blog.content?.sections) {
                setEnSections(blog.content.sections)
            } else {
                setEnSections([])
            }

            setActiveArTab(0)
            setActiveEnTab(0)
        }
    }, [blog, reset])

    // Sync selected department slug in view page
    useEffect(() => {
        if (blog && departments.length > 0) {
            const match = departments.find(
                d => d.name_en === blog.categoryEn || d.name_ar === blog.category || d.slug?.toLowerCase() === blog.category?.toLowerCase() || d.slug?.toLowerCase() === blog.categoryEn?.toLowerCase()
            )
            if (match) {
                setSelectedDeptSlug(match.slug)
            }
        }
    }, [blog, departments])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main" />
            </div>
        )
    }

    if (isError || !blog) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <h3 className="text-lg font-bold text-rose-500">Failed to load the article details.</h3>
                <Button onClick={() => navigate('/blogs')}>{t('back') || 'Go Back'}</Button>
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
                                {isRtl ? 'عرض تفاصيل المقال' : 'View Blog Post Details'}
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isRtl ? 'استعراض البيانات والكتل المحتوياتية في وضع القراءة فقط' : 'Preview all metadata and modular blocks in read-only mode'}
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
                            {t('back') || 'Back'}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => navigate(`/blogs/edit/${blog.slug}`)}
                            className="bg-main hover:bg-main/90 text-white rounded-xl h-10 px-6 font-bold flex-1 md:flex-none"
                        >
                            <Pencil className="h-4.5 w-4.5 mr-2" />
                            {t('edit') || 'Edit'}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">

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
                                        disabled
                                        className="h-10 rounded-xl bg-gray-50 dark:bg-zinc-800/10 cursor-default opacity-85 select-none"
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
                                        disabled
                                        className="h-10 rounded-xl bg-gray-50 dark:bg-zinc-800/10 cursor-default opacity-85 select-none"
                                    />
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        {isRtl ? 'تاريخ عرض ونشر المقال.' : 'Official schedule publish date.'}
                                    </span>
                                </div>

                                <div className="flex flex-col space-y-1.5 justify-end">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-start">
                                        {isRtl ? 'القسم / الإدارة (القسم إنجليزي)' : 'Department (English)'}
                                    </label>
                                    <select
                                        disabled
                                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-100/80 text-sm text-gray-600 cursor-not-allowed opacity-90 select-none focus:outline-none"
                                        value={selectedDeptSlug || ''}
                                    >
                                        <option value="" disabled>{isRtl ? 'اختر قسم...' : 'Select department...'}</option>
                                        {departments.map((d) => (
                                            <option key={d._id} value={d.slug}>
                                                {d.name_en}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/30">
                                <ImageUpload
                                    name="coverImage"
                                    label={t('coverImageLabel') || 'Cover Image'}
                                    currentImageUrl={blog?.coverImage}
                                    aspectRatio="h-44 w-full"
                                    disabled
                                    className="opacity-90"
                                />
                                <ImageUpload
                                    name="authorAvatarUrl"
                                    label={t('authorAvatarUrlLabel') || 'Author Avatar'}
                                    currentImageUrl={blog?.authorAvatarUrl}
                                    aspectRatio="h-44 w-full"
                                    disabled
                                    className="opacity-90"
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

                    {/* SECTION 2: BILINGUAL FIELDS AS MODULAR WORKSPACE */}
                    <div className="space-y-6">

                        {/* ARABIC WORKSPACE */}
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
                                    <BaseInputField name="title" label={t('titleArLabel')} disabled className="h-11 rounded-xl text-base font-bold bg-gray-50/70 cursor-default opacity-85" />
                                    <BaseInputField name="subtitle" label={t('subtitleArLabel')} disabled className="h-11 rounded-xl bg-gray-50/70 cursor-default opacity-85" />
                                    <div className="flex flex-col space-y-1.5 text-start">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-start">
                                            {t('categoryArLabel')}
                                        </label>
                                        <select
                                            disabled
                                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-100/80 text-sm text-gray-600 cursor-not-allowed opacity-90 select-none focus:outline-none"
                                            value={selectedDeptSlug || ''}
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
                                        <BaseInputField name="author" label={t('authorArLabel')} disabled className="h-11 rounded-xl bg-gray-50/70 cursor-default opacity-85" />
                                        <BaseInputField name="readTime" label={t('readTimeArLabel')} disabled className="h-11 rounded-xl bg-gray-50/70 cursor-default opacity-85" />
                                    </div>
                                </div>

                                {/* Dynamic Editor Card for Arabic */}
                                <div className="space-y-4 pt-6 border-t border-border/30">
                                    <div className="bg-slate-50 dark:bg-zinc-800/10 p-5 rounded-2xl border border-border/30 space-y-4">
                                        <div>
                                            <h5 className="text-sm font-black text-foreground">{t('arabicSectionsTitle') || 'أقسام المقال (العربية)'}</h5>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">{t('arabicSectionsDesc') || 'أضف كتل المحتوى وعيّن نصوصها'}</p>
                                        </div>

                                        {/* Tab View Editor Block for Arabic */}
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

                                                {/* Disabled Workspace */}
                                                {arSections[activeArTab] && (
                                                    <div className="p-6 rounded-3xl border border-border bg-slate-50/50 space-y-5 animate-fade-in shadow-xs opacity-90 select-none">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-main uppercase tracking-wider">
                                                                {t('activeBlockConfig', { number: activeArTab + 1 })}
                                                            </span>
                                                        </div>

                                                        {arSections[activeArTab].type === 'quote_card' && (
                                                            <div className="space-y-1">
                                                                <label className="text-xs font-bold text-gray-400 uppercase">{t('quoteAuthor')}</label>
                                                                <input
                                                                    type="text"
                                                                    disabled
                                                                    value={arSections[activeArTab].tag || ''}
                                                                    className="w-full h-11 px-4 rounded-xl border border-border bg-gray-50/50 text-xs text-gray-500 cursor-default focus:outline-none"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-400 uppercase">{t('blockContentText')}</label>
                                                            <textarea
                                                                disabled
                                                                rows={8}
                                                                value={arSections[activeArTab].text}
                                                                className="w-full p-5 rounded-2xl border border-border bg-gray-50/50 text-sm text-gray-500 cursor-default focus:outline-none leading-relaxed min-h-[200px]"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center p-12 border border-dashed border-border rounded-3xl bg-slate-50/50">
                                                <p className="text-xs text-muted-foreground">لا توجد مقاطع مضافة في هذا القسم لترجمتها.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ENGLISH WORKSPACE */}
                        {activeLanguageTab === 'en' && (
                            <div className="space-y-6 bg-card p-6 md:p-8 rounded-3xl border border-border/40 shadow-xs animate-fade-in" dir="ltr">
                                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-black text-xs">EN</span>
                                        <h4 className="text-foreground font-black text-base">{t('englishContentTitle') || 'English Written Workspace'}</h4>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-bold">{isRtl ? 'الإنجليزية نشط' : 'English Active'}</span>
                                </div>

                                <div className="space-y-4">
                                    <BaseInputField name="titleEn" label={t('titleEnLabel')} disabled className="h-11 rounded-xl text-base font-bold bg-gray-50/70 cursor-default opacity-85" />
                                    <BaseInputField name="subtitleEn" label={t('subtitleEnLabel')} disabled className="h-11 rounded-xl bg-gray-50/70 cursor-default opacity-85" />
                                    <div className="flex flex-col space-y-1.5 text-start">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-start">
                                            {t('categoryEnLabel')}
                                        </label>
                                        <select
                                            disabled
                                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-100/80 text-sm text-gray-600 cursor-not-allowed opacity-90 select-none focus:outline-none"
                                            value={selectedDeptSlug || ''}
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
                                        <BaseInputField name="authorEn" label={t('authorEnLabel')} disabled className="h-11 rounded-xl bg-gray-50/70 cursor-default opacity-85" />
                                        <BaseInputField name="readTimeEn" label={t('readTimeEnLabel')} disabled className="h-11 rounded-xl bg-gray-50/70 cursor-default opacity-85" />
                                    </div>
                                </div>

                                {/* Dynamic Editor Card for English */}
                                <div className="space-y-4 pt-6 border-t border-border/30">
                                    <div className="bg-slate-50 dark:bg-zinc-800/10 p-5 rounded-2xl border border-border/30 space-y-4">
                                        <div>
                                            <h5 className="text-sm font-black text-foreground">{t('englishSectionsTitle') || 'Article content blocks (English)'}</h5>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">{t('englishSectionsDesc') || 'Manage and organize paragraphs, headings, and quotes'}</p>
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

                                                {/* Disabled Workspace */}
                                                {enSections[activeEnTab] && (
                                                    <div className="p-6 rounded-3xl border border-border bg-slate-50/50 space-y-5 animate-fade-in shadow-xs opacity-90 select-none">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-main uppercase tracking-wider">
                                                                {t('activeBlockConfig', { number: activeEnTab + 1 })}
                                                            </span>
                                                        </div>

                                                        {enSections[activeEnTab].type === 'quote_card' && (
                                                            <div className="space-y-1">
                                                                <label className="text-xs font-bold text-gray-400 uppercase">{t('quoteAuthor')}</label>
                                                                <input
                                                                    type="text"
                                                                    disabled
                                                                    value={enSections[activeEnTab].tag || ''}
                                                                    className="w-full h-11 px-4 rounded-xl border border-border bg-gray-50/50 text-xs text-gray-500 cursor-default focus:outline-none"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-400 uppercase">{t('blockContentText')}</label>
                                                            <textarea
                                                                disabled
                                                                rows={8}
                                                                value={enSections[activeEnTab].text}
                                                                className="w-full p-5 rounded-2xl border border-border bg-gray-50/50 text-sm text-gray-500 cursor-default focus:outline-none leading-relaxed min-h-[200px]"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center p-12 border border-dashed border-border rounded-3xl bg-slate-50/50">
                                                <p className="text-xs text-muted-foreground">No sections added yet in this workspace.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </FormProvider>
    )
}
