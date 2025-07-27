"use client"

import React, { useCallback, useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import CategoryModal from '../components/CategoryModal'
import { useUser } from '@clerk/nextjs'
import { createCategory, deleteCategory, readCategories, updateCategory } from '../actions'
import { toast } from 'react-toastify'
import { Category } from '@prisma/client'
import EmptyState from '../components/EmptyState'
import { Pencil, Trash } from 'lucide-react'

const Page = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const loadCategories = useCallback(async () => {
    if (!email) return
    const data = await readCategories(email)
    if (data) setCategories(data)
  }, [email])

  useEffect(() => {
    if (email) {
      loadCategories()
    }
  }, [email, loadCategories])

  const openCreateModal = () => {
    setName("")
    setDescription("")
    setEditMode(false)
    setEditingCategoryId(null)
    const modal = document.getElementById("category_modal") as HTMLDialogElement
    modal?.showModal()
  }

  const closeModal = () => {
    setName("")
    setDescription("")
    setEditMode(false)
    setEditingCategoryId(null)
    const modal = document.getElementById("category_modal") as HTMLDialogElement
    modal?.close()
  }

  const handleCreateCategory = async () => {
    if (!email) return
    setLoading(true)
    try {
      await createCategory(name, email, description)
      await loadCategories()
      toast.success("Category created successfully.")
    } catch {
      toast.error("Error while creating the category.")
    } finally {
      setLoading(false)
      closeModal()
    }
  }

  const handleUpdateCategory = async () => {
    if (!email || !editingCategoryId) return
    setLoading(true)
    try {
      await updateCategory(editingCategoryId, email, name, description)
      await loadCategories()
      toast.success("Category updated successfully.")
    } catch {
      toast.error("Error while updating the category.")
    } finally {
      setLoading(false)
      closeModal()
    }
  }

  const openEditModal = (category: Category) => {
    setName(category.name)
    setDescription(category.description || "")
    setEditMode(true)
    setEditingCategoryId(category.id)
    const modal = document.getElementById("category_modal") as HTMLDialogElement
    modal?.showModal()
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this category? All associated products will also be removed."
    )
    if (!confirmDelete || !email) return

    try {
      await deleteCategory(categoryId, email)
      await loadCategories()
      toast.success("Category deleted successfully.")
    } catch {
      toast.error("Error while deleting the category.")
    }
  }

  return (
    <Wrapper>
      <div>
        <div className="mb-4">
          <button className="btn btn-primary" onClick={openCreateModal}>
            Add New Category
          </button>
        </div>

        {categories.length > 0 ? (
          <div>
            {categories.map((category) => (
              <div
                key={category.id}
                className="mb-2 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center"
              >
                <div>
                  <strong className="text-lg">{category.name}</strong>
                  <div className="text-sm">{category.description}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => openEditModal(category)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No categories available"
            IconComponent="Group"
          />
        )}
      </div>

      <CategoryModal
        name={name}
        description={description}
        loading={loading}
        onclose={closeModal}
        onChangeName={setName}
        onChangeDescription={setDescription}
        onSubmit={editMode ? handleUpdateCategory : handleCreateCategory}
        editMode={editMode}
      />
    </Wrapper>
  )
}

export default Page
