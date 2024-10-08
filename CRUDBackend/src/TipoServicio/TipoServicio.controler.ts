import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { TipoServicio } from "./tiposervicio.entity.js";
import { Servicio } from "../Servicio/servicio.entity.js";

const em = orm.em;

async function findAll(req: Request, res: Response) {
    try {
        const tiposServicios = await em.find(TipoServicio, {}, {populate: ['servicio']});
        res.status(200).json({ message: 'Todos los tipos de servicios encontrados', data: tiposServicios });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function getOne(req: Request, res: Response) {
        try {
        const { codigo_tipo } = req.params;

        // Verificar si el código de tipo de servicio es proporcionado
        if (!codigo_tipo) {
            return res.status(400).json({ message: 'Código de tipo de servicio es requerido' });
        }

        const tipoServicio = await em.findOne(TipoServicio, { codigo_tipo: Number(codigo_tipo) });

        // Verificar si se encontró el tipo de servicio
        if (!tipoServicio) {
            return res.status(404).json({ message: 'Tipo de servicio no encontrado' });
        }

        res.status(200).json({ data: tipoServicio });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

async function add(req: Request, res: Response) {
    try {
        const { nombre, descripcion, duracion_estimada, precio_base, servicio_codigo } = req.body;

        // Verificar si el servicio existe
        const servicio = await em.findOne(Servicio, { codigo: servicio_codigo });
        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // Crear un nuevo TipoServicio sin el campo 'codigo_tipo' ya que es auto-incremental
        const tipoServicio = new TipoServicio();
        tipoServicio.nombre = nombre;
        tipoServicio.descripcion = descripcion;
        tipoServicio.duracion_estimada = duracion_estimada;
        tipoServicio.precio_base = precio_base;
        tipoServicio.servicio = servicio;

        await em.persistAndFlush(tipoServicio); // Usa persistAndFlush en lugar de flush

        res.status(201).json({ message: 'Tipo de servicio creado', data: tipoServicio });
    } catch (error: any) {
        console.error('Error en add:', error); // Depuración
        res.status(500).json({ message: error.message });
    }
}

async function update(req: Request, res: Response) {
    try {
        const codigo_tipo = Number(req.params.codigo_tipo);
        if (isNaN(codigo_tipo)) {
            return res.status(400).json({ message: 'Código de tipo de servicio inválido' });
        }

        const tipoServicio = await em.findOne(TipoServicio, { codigo_tipo });
        if (!tipoServicio) {
            return res.status(404).json({ message: 'Tipo de servicio no encontrado' });
        }

        const { nombre, descripcion, duracion_estimada, precio_base, servicio_codigo } = req.body;

        // Si se proporciona un código de servicio, verificar si el servicio existe
        if (servicio_codigo !== undefined) {
            const servicio = await em.findOne(Servicio, { codigo: servicio_codigo });
            if (!servicio) {
                return res.status(404).json({ message: 'Servicio no encontrado' });
            }
            tipoServicio.servicio = servicio;
        }

        // Actualizar los demás campos
        em.assign(tipoServicio, { nombre, descripcion, duracion_estimada, precio_base });
        await em.flush();

        res.status(200).json({ message: 'Tipo de servicio actualizado correctamente', data: tipoServicio });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function remove(req: Request, res: Response) {
    try {
        const codigo_tipo = Number(req.params.codigo_tipo);
        if (isNaN(codigo_tipo)) {
            return res.status(400).json({ message: 'Código de tipo de servicio inválido' });
        }

        const tipoServicio = await em.findOne(TipoServicio, { codigo_tipo });
        if (!tipoServicio) {
            return res.status(404).json({ message: 'Tipo de servicio no encontrado' });
        }

        await em.removeAndFlush(tipoServicio);
        res.status(200).json({ message: 'Tipo de servicio eliminado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export { findAll, getOne, add, update, remove };