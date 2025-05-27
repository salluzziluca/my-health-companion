import React, { useState } from 'react';
import { Button, Card, Form, Select, DatePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createWeeklyDiet } from '../services/api';

const { Option } = Select;

interface WeeklyDietCreatorProps {
    patientId: number;
    professionalId: number;
    onDietCreated: () => void;
}

const WeeklyDietCreator: React.FC<WeeklyDietCreatorProps> = ({
    patientId,
    professionalId,
    onDietCreated,
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

    const handleCreateDiet = async (values: any) => {
        try {
            setLoading(true);
            const weekStartDate = values.weekStartDate.format('YYYY-MM-DD');

            // Create weekly diet
            const dietResponse = await createWeeklyDiet({
                week_start_date: weekStartDate,
                patient_id: patientId,
                professional_id: professionalId,
            });

            message.success('Dieta semanal creada exitosamente');
            onDietCreated();
        } catch (error) {
            message.error('Error al crear la dieta semanal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Crear Dieta Semanal" className="mb-4">
            <Form
                form={form}
                onFinish={handleCreateDiet}
                layout="vertical"
            >
                <Form.Item
                    name="weekStartDate"
                    label="Fecha de inicio de la semana"
                    rules={[{ required: true, message: 'Por favor selecciona la fecha' }]}
                >
                    <DatePicker
                        format="YYYY-MM-DD"
                        disabledDate={(current: { day: () => number; }) => {
                            // Only allow selecting Mondays
                            return current && current.day() !== 1;
                        }}
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<PlusOutlined />}
                    >
                        Crear Dieta Semanal
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default WeeklyDietCreator; 