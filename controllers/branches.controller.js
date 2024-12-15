import Branch from "../models/branch.model.js";

export const registerBranch = async (req, res) => {
  try {
    const { nameBranch, address, phone } = req.body;

    // Verificar si ya existe una sucursal con el mismo nombre o teléfono
    const existingBranch = await Branch.findOne({
      $or: [{ nameBranch }, { phone }],
    });

    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message:
          "El nombre o el número de teléfono ya están registrados para otra sucursal.",
      });
    }

    // Si no hay conflictos, crear la nueva sucursal
    const newBranchToCreate = new Branch({
      nameBranch,
      address,
      phone,
    });

    const newBranchCreated = await newBranchToCreate.save();

    // Respuesta exitosa con los datos de la nueva sucursal
    res.status(201).json({
      success: true,
      message: "Sucursal creada exitosamente",
      branch: newBranchCreated,
    });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({
      success: false,
      message: "Error al crear sucursal",
      error: error.message,
    });
  }
};

export const getBranches = async (req, res) => {
  try {
    const branchs = await Branch.find();
    res.status(200).json(branchs);
  } catch (error) {
    console.log("Error obteniendo branchs: ", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error obteniendo obteniendo branchs",
        error,
      });
  }
};

export const deleteBranch = async (req, res) => {
  console.log("hola")
  try {
    const { id } = req.params; 

    console.log(id);

    const deletedBranch = await Branch.findByIdAndDelete(id);

    if (!deletedBranch) {
      return res.status(404).json({
        success: false,
        message: "Sucursal no encontrada.",
      });
    }

    // Responder con el éxito de la eliminación
    res.status(200).json({
      success: true,
      message: "Sucursal eliminada exitosamente.",
      branch: deletedBranch,
    });
  } catch (error) {
    console.log("Error al eliminar la sucursal:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la sucursal.",
      error: error.message,
    });
  }
};

export const editBranch = async (req, res) => {
  try {
    const { id } = req.params; // Recibir el ID de la sucursal desde los parámetros de la URL
    const { nameBranch, address, phone } = req.body; // Recibir los nuevos datos para actualizar la sucursal

    // Verificar si existe una sucursal con el mismo nombre o teléfono (para no repetir)
    const existingBranch = await Branch.findOne({
      $or: [{ nameBranch }, { phone }],
      _id: { $ne: id }, // Asegurarse de que no sea la misma sucursal
    });

    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message:
          "El nombre o el número de teléfono ya están registrados para otra sucursal.",
      });
    }

    // Actualizar la sucursal con los nuevos datos
    const updatedBranch = await Branch.findByIdAndUpdate(
      id,
      {
        nameBranch,
        address,
        phone,
        updatedAt: Date.now(), // Actualizamos la fecha de modificación
      },
      { new: true }
    ); // Devolvemos el documento actualizado

    if (!updatedBranch) {
      return res.status(404).json({
        success: false,
        message: "Sucursal no encontrada.",
      });
    }

    // Responder con los datos de la sucursal actualizada
    res.status(200).json({
      success: true,
      message: "Sucursal actualizada exitosamente.",
      branch: updatedBranch,
    });
  } catch (error) {
    console.log("Error al editar la sucursal:", error);
    res.status(500).json({
      success: false,
      message: "Error al editar la sucursal.",
      error: error.message,
    });
  }
};

export const addImageToBranches = async (req, res) => {
  try {
    console.log("hola");
    // La imagen se encuentra en req.file
    const imageUrl = req.file ? req.file.path : null;  // Obtener la ruta de la imagen subida
    const branchIds = JSON.parse(req.body.branchIds);  // Obtener branchIds desde req.body

    console.log(imageUrl, branchIds);

    // Verificar si la imagen o las sucursales están presentes
    if (!imageUrl || !branchIds || branchIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Imagen o sucursales no especificadas correctamente.",
      });
    }

    let branchesToUpdate;
    if (branchIds.length === 1 && branchIds[0] === 'all') {
      // Si el array tiene 'all', actualizamos todas las sucursales
      branchesToUpdate = await Branch.find();
    } else {
      // Si hay sucursales seleccionadas, actualizamos solo esas
      branchesToUpdate = await Branch.find({ _id: { $in: branchIds } });
    }

    // Asegurarse de que se encontraron sucursales para actualizar
    if (branchesToUpdate.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron sucursales para actualizar.",
      });
    }

    // Agregar la imagen a cada sucursal seleccionada
    for (let branch of branchesToUpdate) {
      branch.images.push({ url: imageUrl });
      await branch.save(); // Guardar la sucursal actualizada
    }

    // Responder con éxito
    res.status(200).json({
      success: true,
      message: `Imagen agregada exitosamente a ${branchesToUpdate.length} sucursales.`,
    });
  } catch (error) {
    console.error("Error al agregar la imagen a las sucursales:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar la imagen.",
      error: error.message,
    });
  }
};

export const getBranchImages = async (req, res) => {
  try {
    // Obtener el ID de la sucursal desde los parámetros de la URL
    const { id } = req.params;

    // Buscar la sucursal por su ID
    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Sucursal no encontrada.",
      });
    }

    // Retornar las imágenes asociadas a la sucursal
    res.status(200).json({
      success: true,
      images: branch.images, // Devolver el arreglo de imágenes
    });
  } catch (error) {
    console.error("Error al obtener las imágenes de la sucursal:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las imágenes.",
      error: error.message,
    });
  }
};


export const addTextToBranches = async (req, res) => {
  try {
    const { textContent, branchIds } = req.body;

    if (!textContent || !branchIds || branchIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Texto o sucursales no especificados correctamente.",
      });
    }

    let branchesToUpdate;
    if (branchIds.length === 1 && branchIds[0] === 'all') {
      branchesToUpdate = await Branch.find();
    } else {
      branchesToUpdate = await Branch.find({ _id: { $in: branchIds } });
    }

    if (branchesToUpdate.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron sucursales para actualizar.",
      });
    }

    for (let branch of branchesToUpdate) {
      branch.texts.push({ content: textContent });
      await branch.save();
    }

    res.status(200).json({
      success: true,
      message: `Texto agregado exitosamente a ${branchesToUpdate.length} sucursales.`,
    });
  } catch (error) {
    console.error("Error al agregar el texto a las sucursales:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar el texto.",
      error: error.message,
    });
  }
};


export const getBranchTexts = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Sucursal no encontrada.",
      });
    }

    res.status(200).json({
      success: true,
      texts: branch.texts,
    });
  } catch (error) {
    console.error("Error al obtener los textos de la sucursal:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los textos.",
      error: error.message,
    });
  }
};


export const getBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findById(id).populate('images').populate('texts'); 

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Sucursal no encontrada.",
      });
    }

    res.status(200).json({
      success: true,
      branch,
    });
  } catch (error) {
    console.error("Error al obtener la sucursal:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la sucursal.",
      error: error.message,
    });
  }
};

export const deleteImageFromBranch = async (req, res) => {
  const { id, imageId } = req.params;

  console.log("iumage")

  try {
    const branch = await Branch.findById(id);
    if (!branch) return res.status(404).json({ message: 'Sucursal no encontrada' });

    const updatedImages = branch.images.filter(image => image._id.toString() !== imageId);
    branch.images = updatedImages;

    await branch.save();

    res.status(200).json({ message: 'Imagen eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    res.status(500).json({ message: 'Hubo un error al eliminar la imagen', error });
  }
};

export const deleteTextFromBranch = async (req, res) => {
  const { id, textId } = req.params;
  console.log(req.params)

  console.log("text");

  try {
    const branch = await Branch.findById(id);  // Encuentra la sucursal por ID

    await console.log(branch)
    if (!branch) return res.status(404).json({ message: 'Sucursal no encontrada' });

    // Filtra y elimina el texto con el ID proporcionado
    const updatedTexts = branch.texts.filter(text => text._id.toString() !== textId);
    branch.texts = updatedTexts;

    // Guarda los cambios en la base de datos
    await branch.save();

    res.status(200).json({ message: 'Texto eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el texto:', error);
    res.status(500).json({ message: 'Hubo un error al eliminar el texto', error });
  }
};
