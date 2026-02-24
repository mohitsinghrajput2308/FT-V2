import { useState } from 'react';
import { Plus, Edit2, Trash2, Tags, Palette } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';

const colorOptions = [
    { value: '#ef4444', label: 'Red' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#10b981', label: 'Green' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#6366f1', label: 'Indigo' },
    { value: '#14b8a6', label: 'Teal' },
    { value: '#6b7280', label: 'Gray' }
];

const Categories = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [categoryType, setCategoryType] = useState('expense');
    const [formData, setFormData] = useState({ name: '', color: '#3b82f6' });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Category name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (editingItem) {
            updateCategory(categoryType, editingItem.id, formData);
        } else {
            addCategory(categoryType, formData);
        }
        closeModal();
    };

    const openModal = (type, item = null) => {
        setCategoryType(type);
        if (item) {
            setEditingItem(item);
            setFormData({ name: item.name, color: item.color });
        } else {
            setEditingItem(null);
            setFormData({ name: '', color: '#3b82f6' });
        }
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = (type, id) => {
        if (window.confirm('Delete this category?')) {
            deleteCategory(type, id);
        }
    };

    const isPreDefined = (id) => {
        return id.startsWith('cat_') || id.startsWith('inc_');
    };

    const CategoryCard = ({ type, title }) => {
        const items = categories[type] || [];

        return (
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <Button size="sm" onClick={() => openModal(type)} icon={Plus}>
                        Add
                    </Button>
                </div>

                <div className="space-y-2">
                    {items.map((cat) => (
                        <div
                            key={cat.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-300"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openModal(type, cat)}
                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-400 text-gray-500"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                {!isPreDefined(cat.id) && (
                                    <button
                                        onClick={() => handleDelete(type, cat.id)}
                                        className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <p className="text-center py-4 text-gray-400">No categories yet</p>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your income and expense categories</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryCard type="expense" title="Expense Categories" />
                <CategoryCard type="income" title="Income Categories" />
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Category' : 'Add Category'} size="sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Category Name"
                        name="name"
                        placeholder="Enter category name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                    />

                    <div>
                        <label className="label">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: opt.value })}
                                    className={`w-8 h-8 rounded-full transition-transform ${formData.color === opt.value ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
                                        }`}
                                    style={{ backgroundColor: opt.value }}
                                    title={opt.label}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth>
                            {editingItem ? 'Update' : 'Add'} Category
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
