import React, { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ModalStatus } from '@/components/shared/modal-status'
import { BaseInputField } from '@/components/shared/base-input-field'
import { Settings, Info } from 'lucide-react'
import { registrationSchema, type RegistrationFormData } from '@/schemas/registration'

export default function Help() {
  const [modalOpen, setModalOpen] = useState(false)

  // Set up form methods using react-hook-form
  const methods = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: '',
      pass: '',
      dob: '',
    }
  })

  const onSubmit = (data: RegistrationFormData) => {
    toast.success(`Form Validated!\nUser: ${data.username}\nDate: ${data.dob}`)
    setModalOpen(false)
    methods.reset()
  }
  const { register, handleSubmit, watch, formState: { errors } } = methods

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Component Playground</h1>
        <p className="text-sm text-gray-500 mt-1">Verify and test the custom BaseInputField and ModalStatus components.</p>
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Fields Preview Card */}
        <Card className="border-gray-100 bg-white">
          <CardHeader className="border-b border-gray-50 py-4 px-6">
            <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Settings className="h-4 w-4 text-main" /> Base Input Fields Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <BaseInputField name="demoText" label="Text Input (Default)" placeholder="Enter simple text..." />
            <BaseInputField name="demoPass" label="Password Input" type="password" placeholder="Enter secure password..." />
            <BaseInputField name="demoDate" label="Date Picker Input" type="date" />
            <BaseInputField name="demoTime" label="Time Picker Input" type="time" />
            <BaseInputField name="demoNum" label="Number Input" type="number" placeholder="Enter number quantity..." min={0} />
          </CardContent>
        </Card>

        {/* Modal Status Showcase Card */}
        <Card className="border-gray-100 bg-white flex flex-col justify-between">
          <div>
            <CardHeader className="border-b border-gray-50 py-4 px-6">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Info className="h-4 w-4 text-main" /> Modal Dialog Controller
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                Click the button below to launch the status modal. The modal contains a dynamic form built with <strong>react-hook-form</strong> and validated with <strong>Zod</strong> schemas.
              </p>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Button
              onClick={() => setModalOpen(true)}
              className="w-full bg-main hover:opacity-90 text-white py-2.5 rounded-xl font-bold"
            >
              Open Status Modal
            </Button>
          </div>
        </Card>
      </div>

      {/* Reusable ModalStatus Component Instance */}
      <ModalStatus
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Account Setup Wizard"
        description="Please fill out the following profile fields to complete the registration process."
        agreeLabel="Save Settings"
        cancelLabel="Discard"
        onAgreeButtonClick={methods.handleSubmit(onSubmit)}
        onCancelButtonClick={() => {
          setModalOpen(false)
          methods.reset()
          toast.error('Actions discarded')
        }}
      >
        {/* Wrap form fields with FormProvider to enable auto-context binding */}
        <FormProvider {...methods}>
           
          <div className="space-y-4">
            <BaseInputField
              name="username"
              label="Profile Username"
              placeholder="john_doe"
            />

            <BaseInputField
              name="pass"
              type="password"
              label="Access Password"
              placeholder="••••••"
            />

            <BaseInputField
              name="dob"
              type="date"
              label="Date of Birth"
            />
          </div>
        </FormProvider>
      </ModalStatus>
    </div>
  )
}
