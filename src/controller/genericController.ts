import express from "express";

export interface GenericController{
    path:string;
    router:express.Router
    initRouter():void
}