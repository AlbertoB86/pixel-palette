(function() {
    window.addEventListener('load', iniciar);

    function iniciar(){
        const boton = document.getElementById('generate-btn');
        const colores = document.getElementById('palette');   
        const ejemplos = document.getElementById('ejemplos');

        const toggle = document.getElementById('selector');
        toggle.addEventListener('change', actualizarFormato);  

        const dragInfo = document.getElementById('drag-info');
        const bombilla = document.getElementById('bombilla');
        let encendida = false;
        let animacionBombillaActiva = false;

        const copyInfo = document.getElementById('copy-info');

        const colorPicker = new iro.ColorPicker("#colorWheel", {
            width: 180,
            color: "#fff7fa",
            borderWidth: 2,
            borderColor: "#41255a"
            });

            const input = document.getElementById('color-base');

            // Actualiza input cuando cambia la rueda
            colorPicker.on('color:change', function(color) {
            input.value = color.hexString.toUpperCase();
            });

            // Actualiza rueda si se escribe un color válido
            input.addEventListener('change', function() {
            if (chroma.valid(input.value)) {
                colorPicker.color.hexString = input.value;
            } else {
                alert("Introduce un color HEX válido");
            }
        });


        boton.addEventListener('click', () =>{    
            const inputColor = document.getElementById('color-base').value.trim().toUpperCase();

            //Asignamos al color base el elegido por el usuario y si no elige ninguno lo pone aleatorio
            const base = chroma.valid(inputColor) ? chroma(inputColor) : chroma.random();

            //Llamada a la funcion selectArmonia 
            const opcion = document.getElementById('harmony').value;
            let armonia = selectArmonia(base, opcion);      
            
            //Constante para comprobar el estado del HEX o RGB
            const hexRgb = toggle.checked;

            //Generamos la paleta con 5 colores partiendo del color base, y segun la armonia que decidamos
            const escala = chroma.scale([base, armonia]).mode('lab').colors(5);

            colores.innerHTML = '';
            ejemplos.innerHTML = '';      

            /* Bucle para generar los 5 colores de la paleta, creamos la caja
                Añadimos el color al fondo de la caja y ponemos el texto en RGB o HEX segun */ 
            for(let i = 0; i < escala.length; i++){
                const col = chroma(escala[i]);
                let color = document.createElement('div');

                color.className = 'caja';
                color.style.backgroundColor = escala[i];

                color.innerText = hexRgb ? col.css() : col.hex().toUpperCase();

                // Contraste para texto legible
                const contraste = chroma.contrast(col, 'white');
                color.style.color = contraste > 4.5 ? 'white' : 'black';

                //Le añadimos a color el atributo para que sea arrastable
                color.setAttribute('draggable', true);
                //e.dataTransfer sirve para guardar el valor y recuperarlo al soltar
                color.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', escala[i]); 
                });

                color.addEventListener('click', () => copiar(color));

                colores.appendChild(color);

                document.querySelector('.roles').classList.remove('hidden');
                
            }  

            const zonas = document.querySelectorAll('.drop-zone');

            zonas.forEach(zona =>{
                zona.addEventListener('dragover', e => {
                    e.preventDefault(); // Permite soltar
                    zona.style.borderColor = '#fff'; // Feedback visual opcional
                });

                zona.addEventListener('dragleave', () => {
                    zona.style.borderColor = '#ccc';
                });

                zona.addEventListener('drop', e =>{
                    e.preventDefault();
                    zona.style.borderColor = '#ccc';
                    const color = e.dataTransfer.getData('text/plain');
                    aplicarColor(zona.dataset.role, color);
                });
            });

            const objColores = asignarColores(escala);

            ejemplos.style.backgroundColor = objColores.fondo;

            let titulo = document.createElement('h1');
            titulo.id = 'titulo-preview';
            titulo.style.color = objColores.titulo;
            titulo.innerText = 'H1 de Ejemplo';

            let texto = document.createElement('p');
            texto.id = 'texto-preview';
            texto.style.color = objColores.texto;
            texto.innerText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia tempora excepturi, eos minima exercitationem, facere eaque sit natus sint alias reiciendis! Nulla beatae omnis odit reiciendis repudiandae. Ipsam, asperiores ea.';

            let boton = document.createElement('button');
            boton.id = 'boton-ejemplo';
            boton.style.color = objColores.botonTexto;
            boton.style.background = objColores.botonFondo;
            boton.innerText = 'Pulsar';

            ejemplos.appendChild(titulo);
            ejemplos.appendChild(texto);
            ejemplos.appendChild(boton);

            //Cambia la bombilla a "on" / "off" cada seg
            dragInfo.classList.remove('hidden');
            if (!animacionBombillaActiva){
                animacionBombillaActiva = true;
                intervaloBombilla = setInterval(() => {
                    encendida = !encendida;
                    bombilla.src = encendida 
                        ? './assets/icons/lightbulb-pixel-on.png' 
                        : './assets/icons/lightbulb-pixel-off.png';
                },1000);
            }
            copyInfo.classList.remove('hidden');
        });

        // Funcion para seleccionar una Armonia, 
        function selectArmonia(base, opcion){
            let armonia = '';

            switch(opcion){
                case 'random':
                    armonia = chroma.random();
                    break;
                case 'analogous':
                    armonia = base.set('hsl.h', (base.get('hsl.h') + 30) % 360);
                    break;
                case 'complementary':
                    armonia = base.set('hsl.h', (base.get('hsl.h') + 180) % 360);
                    break;
                case 'monochromatic':
                    armonia = base.set('hsl.l', (base.get('hsl.l') > 0.5 ? base.get('hsl.l') - 0.3 : base.get('hsl.l') + 0.3));
                    break;
                case 'triadic':
                    armonia = base.set('hsl.h', (base.get('hsl.h') + 120) % 360); 
                    break;
                default:
                    armonia = chroma.random();
                    break;
            }
            return armonia;
        }
        
        // Funcion para cambiar el texto entre HEX o RGB
        function actualizarFormato(){
            const cajas = document.querySelectorAll('.caja');
            const hexRgb = toggle.checked;

            cajas.forEach(caja =>{
                const bg = caja.style.backgroundColor;
                const color = chroma(bg);
                caja.innerText = hexRgb ? color.css() : color.hex().toUpperCase();
            });
        }

        // Funcion para asiganr los valore spor defecto en los ejemplos
        function asignarColores(escala){
            //Ordenamos los colores de más oscuro aa más claro
            const ordenados = [...escala].sort((a, b) => chroma(a).luminance() - chroma(b).luminance());

            return{
                fondo: ordenados[4],
                titulo: ordenados[1],
                texto: ordenados[2],
                botonFondo: ordenados[3],
                botonTexto: ordenados[0]
            }
        }

        // Funcion para que el usuario pueda cambiar los colores en los ejemplos
        function aplicarColor(role, color){
            const titulo = document.getElementById('titulo-preview');
            const texto = document.getElementById('texto-preview');
            const boton = document.getElementById('boton-ejemplo');

            switch(role){
                case 'fondo':
                    ejemplos.style.backgroundColor = color;
                    break;
                case 'titulo':
                    titulo.style.color = color;
                    break;
                case 'texto':
                    texto.style.color = color;
                    break;
                case 'botonFondo':
                    boton.style.background = color;
                    break;
                case 'botonTexto':
                    boton.style.color = color;
                    break;
            }
        }

        function copiar(color){        
            navigator.clipboard.writeText(color.textContent)
            .then(() => {
                const original = color.textContent;
                color.textContent = 'Copiado!';
                setTimeout(() => {
                    color.innerText = original;
                }, 1500);
            })
            .catch(err => {
                console.error('Error al copiar:', err);
            });       
            
        }
    }

})();


