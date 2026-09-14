from django.shortcuts import render

def transferencia(request):
    resultado = ""
    dato = None
    metodo = request.method

    if request.method == "GET":
        dato = request.GET.get("dato")
        if dato:
            resultado = "El dato llego mediante GET"
    elif request.method == "POST":
        dato = request.POST.get("dato")
        if dato:
            resultado = "El dato llego mediante POST"


    return render(request, "app_transferencia/index.html", {
        "resultado": resultado, 
        "dato": dato, 
        "metodo": metodo
    })