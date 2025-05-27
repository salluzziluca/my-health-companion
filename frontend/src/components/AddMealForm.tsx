import React, { useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { addMealToDiet } from '../services/api';

const { Option } = Select;

interface AddMealFormProps {
    weeklyDietId: number;
    onMealAdded: () => void;
}

const AddMealForm: React.FC<AddMealFormProps> = ({
    weeklyDietId,
    onMealAdded,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const daysOfWeek = [
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
        'domingo',
    ];

    const mealsOfDay = [
        { value: 'breakfast', label: 'Desayuno' },
        { value: 'lunch', label: 'Almuerzo' },
        { value: 'snack', label: 'Merienda' },
        { value: 'dinner', label: 'Cena' },
    ];

    const handleAddMeal = async (values: any) => {
        try {
            setLoading(true);
            await addMealToDiet(weeklyDietId, {
                meal_name: values.meal_name,
                day_of_week: values.day_of_week,
                meal_of_the_day: values.meal_of_the_day,
                food_id: values.food_id,
            });
            message.success('Comida agregada exitosamente');
            form.resetFields();
            onMealAdded();
        } catch (error) {
            message.error('Error al agregar la comida');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            onFinish={handleAddMeal}
            layout="vertical"
            className="add-meal-form"
        >
            <Form.Item
                name="meal_name"
                label="Nombre de la comida"
                rules={[{ required: true, message: 'Por favor ingresa el nombre de la comida' }]}
            >
                <Input placeholder="Ej: Ensalada de pollo" />
            </Form.Item>

            <Form.Item
                name="day_of_week"
                label="Día de la semana"
                rules={[{ required: true, message: 'Por favor selecciona el día' }]}
            >
                <Select placeholder="Selecciona el día">
                    {daysOfWeek.map(day => (
                        <Option key={day} value={day}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="meal_of_the_day"
                label="Momento del día"
                rules={[{ required: true, message: 'Por favor selecciona el momento del día' }]}
            >
                <Select placeholder="Selecciona el momento">
                    {mealsOfDay.map(meal => (
                        <Option key={meal.value} value={meal.value}>
                            {meal.label}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="food_id"
                label="ID del alimento"
                rules={[{ required: true, message: 'Por favor ingresa el ID del alimento' }]}
            >
                <Input type="number" placeholder="Ej: 123" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Agregar Comida
                </Button>
            </Form.Item>
        </Form>
    );
};

export default AddMealForm; 