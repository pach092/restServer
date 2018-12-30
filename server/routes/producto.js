const express = require("express")
const _ = require("underscore")

const { verificaToken } = require("../middlewares/autenticacion")

let app = express()
let Producto = require("../models/producto")

app.get("/producto", verificaToken, (req, res) => {
    let desde = req.query.desde || 0
    let limite = req.query.limite || 5

    desde = Number(desde)
    limite = Number(limite)

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate("categoria", "descripcion")
        .populate("usuario", "nombre, email")
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })
        })
})

app.get("/producto/:id", verificaToken, (req, res) => {
    let id = req.params.id

    Producto.findById(id)
        .populate("categoria", "descripcion")
        .populate("usuario", "nombre, email")
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productoDB) {
                return res.json({
                    ok: false,
                    err: {
                        message: "El producto no existe"
                    }
                })
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        })
})

app.get("/producto/buscar/:termino", verificaToken, (req, res) => {
    let termino = req.params.termino

    let regex = new RegExp(termino, "i")

    Producto.find({ nombre: regex })
        .populate("categoria", "descripcion")
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })
        })
})

app.post("/producto", verificaToken, (req, res) => {
    let body = req.body

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    producto.save((err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        res.status(201).json({
            ok: true,
            producto
        })
    })
})

app.put("/producto/:id", verificaToken, (req, res) => {
    let id = req.params.id

    let body = _.pick(req.body, ["nombre", "precioUni", "disponible", "descripcion", "categoria"])

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.json({
                ok: false,
                err: {
                    message: "El producto no existe"
                }
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    })

})

app.delete("/producto/:id", verificaToken, (req, res) => {
    let id = req.params.id

    let body = { disponible: false }

    Producto.findByIdAndUpdate(id, body, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.json({
                ok: false,
                err: {
                    message: "El producto no existe"
                }
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    })
})

module.exports = app