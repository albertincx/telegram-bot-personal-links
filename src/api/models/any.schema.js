const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const anySchema = new mongoose.Schema(
  {},
  {
    timestamps: {createdAt: true, updatedAt: false},
    strict: false,
  },
);

anySchema.method({
  transform() {
    return this.toObject();
  },
});

anySchema.statics = {
  connect(modelName) {
    try {
      const {conn} = this.collection;
      const {schema} = this;
      if (modelName) {
        return conn.model(modelName, schema);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }

    return false;
  },
};

module.exports = anySchema;
