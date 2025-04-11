package main

import (
	"github.com/gin-gonic/gin"
)

const PublicDir string = "./public/"

func main(){
	router := gin.Default() //Idu ond request router na srusti madutthe
	// gin.Default() *Engine Engine is a type defined in Gin

	router.Static("/", PublicDir)
	// "/" andre root url, PublicDir andre html, css, js files na dir

	err := router.SetTrustedProxies([]string{"127.0.0.1"})
	if err!=nil{
		panic(err)
	}
	// Must use a reverse proxy or a load balencer in production and change the ip addr in the SetTrustedProxies arguement to that of the reverse proxy or load balencer

	router.Run(":8080") 
	//:8080 kotre ella interface galalli tcp port 8080 alli serve agutthe
	// ade <ip addr>:<port> kottre a ondu interface alli maatra serve agutthe
}
