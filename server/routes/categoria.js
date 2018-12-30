const express = require("express")
const _ = require("underscore")

let { verificaToken, verificaAdminRole } = require("../middlewares/autenticacion")

let app = express()

const Categoria = require("../models/categoria")

app.get("/categoria", verificaToken, (req, res) => {
    Categoria.find({})
        .sort("descripcion")
        .populate("usuario", "nombre email")
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            Categoria.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                })
            })
        })
})

app.get("/categoria/:id", verificaToken, (req, res) => {
    let id = req.params.id

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria
        })
    })
})

app.post("/categoria", verificaToken, (req, res) => {
    let categoria = new Categoria({
        descripcion: req.body.descripcion,
        usuario: req.usuario._id
    })

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

app.put("/categoria/:id", verificaToken, (req, res) => {
    let id = req.params.id
    let body = _.pick(req.body, ["descripcion"])

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "La categoria no existe"
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

app.delete("/categoria/:id", [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "La categoria no existe"
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})



module.exports = app