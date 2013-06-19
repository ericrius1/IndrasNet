 var Comm = function() {
   this.socket = io.connect();
 }

Comm.prototype.listen = function(){
  this.socket.on('activate_light', function(id){
    world.activate_light(id);
  });

  this.socket.on('update_light', function(light){
    world.recieve_update_light(light);
  });

  this.socket.on('update_lights', function(lights){
    world.recieve_update_lights(lights);
  })
}


Comm.prototype.update_light = function(light){
  this.socket.emit('update_light', light);
}
