import express from "express";

/**
 * Controller generic class used as interface for other controllers.
 */
export interface GenericController{
    path:string;
    router:express.Router
    initRouter():void
}