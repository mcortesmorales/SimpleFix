from app import mongo

class UserModel:
    @staticmethod
    def create_user(user_data):
        """Crea un nuevo usuario en la base de datos."""
        return mongo.db.users.insert_one(user_data)

    @staticmethod
    def get_user_by_userName(name):
        """Obtiene un usuario por su correo electrónico."""
        return mongo.db.users.find_one({"userName": name})

    @staticmethod
    def update_user(name, update_data):
        """Actualiza un usuario basado en su email."""
        return mongo.db.users.update_one(
            {"userName": name}, {"$set": update_data}
        )